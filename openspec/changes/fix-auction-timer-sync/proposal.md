## Why

The current auction timer mechanism relies on calculating the difference between the `end_time` and the client's local system clock (`Date.now()`). This causes severe desynchronization between users if their computer clocks are not perfectly synchronized, leading to viewers seeing different remaining times. Furthermore, the anti-sniping rule (adding 30 seconds to the timer if a bid is placed in the last 30 seconds) is missing or not functioning correctly, and auctions need to securely close exactly when the timer expires.

## What Changes

- **Synchronized Timer Calculation**: Modify the frontend to calculate the remaining time independent of the local computer clock drift. The server will provide the exact `end_time`, and the frontend will use a synchronized offset (or rely on periodic server "tick" updates) to ensure every single viewer and the seller see the exact same countdown, down to the second.
- **Anti-sniping Rule Enforcement**: Modify the bidding logic (`recordBid`) so that if a bid is placed when the remaining time is 30 seconds or less, the auction's `end_time` is extended by 30 seconds.
- **Real-time Extension Broadcast**: When an anti-sniping extension occurs, broadcast the `NEW_END_TIME` to all connected clients immediately via WebSocket so the timer visually jumps back up for everyone.
- **Guaranteed Automatic Closure**: Ensure the closure worker accurately detects the end of the auction, closes the WebRTC stream, processes the winner or "no winner" state, and logs the outcome in the auction history.

## Capabilities

### New Capabilities
- `auction-timer-sync`: Core synchronization mechanism for the auction countdown, anti-sniping logic, and guaranteed automatic closure across all clients.

### Modified Capabilities


## Impact

- **Backend (`pujaController.js`)**: Modifying the bid placement endpoint to evaluate the remaining time and execute `DATE_ADD(end_time, INTERVAL 30 SECOND)` if within the threshold.
- **Frontend (`SellerLiveVideo.jsx`, `LiveAuctionVideo.jsx`, `AuctionTimer.jsx`)**: Updating how the countdown is calculated to avoid local clock reliance, and ensuring it smoothly handles `NEW_END_TIME` WebSocket events.
- **WebSocket Service (`bidding-service`)**: Ensuring the broadcast of new end times happens instantaneously upon a valid anti-snipe bid.
