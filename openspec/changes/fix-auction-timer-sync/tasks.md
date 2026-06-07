## 1. Backend: Anti-sniping Implementation

- [x] 1.1 In `auction-service/controllers/pujaController.js` `recordBid`, check if the auction's `end_time` is within 30 seconds of `NOW()`. If so, execute an `UPDATE` query adding 30 seconds to `end_time`.
- [x] 1.2 In `recordBid`, if the time was extended, fetch the updated `end_time` and broadcast it via the `bidding-service` endpoint (`/broadcast`) using `type: 'NEW_END_TIME'`.

## 2. Backend: WebSocket Time Synchronization

- [x] 2.1 In `bidding-service/index.js`, update the `SESSION_INIT` payload (or a dedicated sync payload) to include the backend's current time: `serverTime: new Date().toISOString()`.
- [x] 2.2 In `bidding-service/index.js`, when sending `NEW_END_TIME` on `JOIN_ROOM`, also ensure `serverTime` is sent if necessary, so the client has an absolute reference point.

## 3. Frontend: Timer Synchronization

- [x] 3.1 In `frontend/src/hooks/useWebSocket.js`, extract `serverTime` from the initialization event and calculate a `serverTimeOffset` (`Date.now() - new Date(serverTime).getTime()`).
- [x] 3.2 Update `LiveAuctionVideo.jsx` and `SellerLiveVideo.jsx` (or `AuctionTimer.jsx` if it exists) to use the `serverTimeOffset` when calculating `timeLeft`. Instead of `endTime - Date.now()`, use `endTime - (Date.now() - serverTimeOffset)`. This guarantees all users see the exact same countdown.
