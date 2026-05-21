## Context

Currently, the auction timer (`AuctionTimer.jsx` and countdown logic in `SellerLiveVideo.jsx`/`LiveAuctionVideo.jsx`) calculates the remaining time by taking `end_time` and subtracting the user's local `Date.now()`. This is causing severe desynchronization because computer clocks are rarely perfectly aligned. If the seller's clock is 30 seconds behind a viewer's clock, they will see timers that differ by exactly 30 seconds. This breaks the fundamental UX of a real-time live auction where the countdown must be universally identical.

Additionally, the anti-sniping feature (extending the auction by 30 seconds if a bid is placed in the final 30 seconds) requires robust implementation at the server level, ensuring the time is safely extended in the database and then instantaneously propagated to all clients via WebSocket.

## Goals / Non-Goals

**Goals:**
- Guarantee that all clients (seller and viewers) see the exact same countdown.
- Implement the anti-sniping rule reliably in the backend.
- Maintain a highly responsive UI that reflects time extensions immediately.
- Ensure the auction automatically closes accurately when time runs out.

**Non-Goals:**
- Implementing an NTP client in the browser (too complex, overkill).
- Storing bid histories differently than the current system.
- Completely rebuilding the WebSocket infrastructure.

## Decisions

**1. Time Remaining via Server Broadcast (or Server Offset)**
*Decision*: Instead of sending `end_time` as an absolute ISO string and trusting the client's clock, we will calculate the `timeLeft` (in seconds) or use the Database's `NOW()` relative time. We already updated the backend to use `DATE_ADD(NOW(), INTERVAL x MINUTE)`. We will implement a client-side server-time offset calculation OR calculate `remaining_seconds` on the server before sending to the client, adjusting the local clock reference.
*Rationale*: Syncing by calculating `serverTime - localTime` offset on connection guarantees the countdown will be accurate relative to the server regardless of local clock drift.

**2. Anti-sniping logic in `pujaController.js`**
*Decision*: In `recordBid`, before inserting the bid, check if `end_time - NOW() <= 30`. If true, `UPDATE pujas SET end_time = DATE_ADD(end_time, INTERVAL 30 SECOND)`. Then broadcast `NEW_END_TIME`.
*Rationale*: Server-authoritative logic is strictly required to prevent race conditions. `mysql2` enables us to do this within the database transaction reliably.

## Risks / Trade-offs

- **Risk: WebSocket Latency** → Mitigation: The `NEW_END_TIME` broadcast should be extremely small and prioritized. The offset sync will happen on initial connection, so minor network jitter during the bid won't ruin the absolute timer.
- **Risk: Closure Worker Race Conditions** → Mitigation: The `checkExpiredAuctions` worker runs every 5 seconds. If a bid extends the time right as the worker is checking, the transaction isolation in MySQL ensures the worker either sees it as live or ended. The anti-snipe logic will be rejected if `status != 'live'`.
