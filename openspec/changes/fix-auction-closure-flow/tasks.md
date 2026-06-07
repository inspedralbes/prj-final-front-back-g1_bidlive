## 1. WebRTC Fixes

- [x] 1.1 In `SellerLiveVideo.jsx`, inside `startBroadcast` immediately after capturing `navigator.mediaDevices.getUserMedia()`, iterate over existing peers (`peersRef.current`). Add the new `streamRef.current` tracks to their peer connections using `pc.addTrack`, and call `sendOfferToViewer(viewerSessionId)` to renegotiate the connection.

## 2. Frontend UI/UX Fixes

- [x] 2.1 In `LiveAuctionVideo.jsx`, inside the `useEffect` that handles `auctionEnded`, completely remove the `setInterval` and `setTimeout` that forcefully calls `navigate('/')` after 5 seconds.
- [x] 2.2 In `LiveAuctionVideo.jsx`, add a "Volver a Inicio" button to the end-of-auction overlay (`showEndedPopup`), allowing viewers to exit the page gracefully.
- [x] 2.3 In `SellerLiveVideo.jsx`, delete the unused `declareWinner` function and its related states if they are still lingering.
- [x] 2.4 In `SellerLiveVideo.jsx`, update the `AUCTION_ENDED` WebSocket handler. Remove `setTimeout(() => navigate('/seller'), 1500)`. Instead, just set a state to show the result.
- [x] 2.5 In `SellerLiveVideo.jsx`, create an overlay (similar to `LiveAuctionVideo.jsx`) to display the end result (`endData.winnerId`, `endData.finalPrice`) with a "Volver al Dashboard" button.
