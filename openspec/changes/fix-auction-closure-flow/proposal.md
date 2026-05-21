## Why

There are three severe UI/UX issues affecting the auction lifecycle: 1) The seller's camera remains black for viewers who join the room *before* the seller clicks "Go Live", because WebRTC tracks are not added to pre-existing peer connections. 2) The seller is aggressively forced out of the auction room upon closure via a redirect, preventing them from seeing the final outcome (Winner/Desierta). 3) Viewers are also aggressively redirected after 5 seconds, ruining the excitement of winning or losing.

## What Changes

- **WebRTC Dynamic Renegotiation**: When the seller clicks "Go Live", the newly acquired camera tracks will be injected into all *existing* viewer peer connections, followed by an immediate renegotiation (Offer -> Answer), ensuring no viewer sees a black screen.
- **Removed Aggressive Redirects**: The hardcoded `navigate('/')` and `navigate('/seller')` timeouts on auction end will be removed.
- **Unified Closure Popups**: The seller will now see the exact same "Auction Ended" UI (Winner / Desierta) as the viewers, allowing them to review the final price and winner username peacefully before manually clicking a "Return to Dashboard" button.

## Capabilities

### New Capabilities
- `auction-closure-ux`: Overhaul of the closure UI/UX to ensure persistence of the final state on-screen for both seller and viewer without forced redirects.
- `webrtc-renegotiation`: Ensures reliable stream delivery to viewers regardless of when they connect to the room.

## Impact

- **Frontend (`SellerLiveVideo.jsx`)**: Fixes WebRTC `addTrack` logic inside `startBroadcast`. Adds the `AuctionTimer` to the HUD. Removes forced `navigate('/seller')` on closure, and replaces it with a proper end-of-auction summary overlay.
- **Frontend (`LiveAuctionVideo.jsx`)**: Removes the 5-second forced redirect loop on closure.
