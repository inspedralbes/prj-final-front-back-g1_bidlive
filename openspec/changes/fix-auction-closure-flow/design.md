## Context

The system currently relies on the backend `closureService` to automatically terminate auctions exactly when time expires. While this works beautifully on the backend, the frontend components (`LiveAuctionVideo.jsx` and `SellerLiveVideo.jsx`) aggressively tear down the UI and redirect the users almost immediately when they receive the `AUCTION_ENDED` WebSocket event. This prevents them from digesting the result. Furthermore, a WebRTC lifecycle bug causes viewers who join before the stream starts to see a black screen because their peer connections aren't updated when the camera track is finally captured.

## Goals / Non-Goals

**Goals:**
- Guarantee viewers who arrive early see the video the moment the seller clicks "Go Live".
- Stop forced redirects upon auction end for both the seller and the viewers.
- Display a unified, clear "Winner" or "Desierta" overlay to the seller and viewers, requiring manual interaction to leave the page.

**Non-Goals:**
- Changing the backend closure logic (it is already perfectly automated).

## Decisions

**1. WebRTC Track Injection on "Go Live"**
*Decision*: When `navigator.mediaDevices.getUserMedia` resolves in `startBroadcast`, we will iterate through the `peersRef.current` map. For each existing peer connection, we will add the new tracks and explicitly call `sendOfferToViewer` to trigger a renegotiation.
*Rationale*: WebRTC requires a new Offer/Answer cycle whenever tracks are added dynamically after the initial connection is established.

**2. Removing Aggressive UX Redirects**
*Decision*: In `LiveAuctionVideo.jsx` and `SellerLiveVideo.jsx`, the `setTimeout` and `setInterval` that call `navigate(...)` after auction end will be completely deleted. We will add a "Return to Dashboard" / "Go Home" button on the end-state overlays.
*Rationale*: Users want to look at the final statistics and outcome without being ripped away from the page unexpectedly.

## Risks / Trade-offs

- **Risk: WebRTC renegotiation glare** → Mitigation: By doing this strictly on "Go Live" (a single one-time event), we avoid glare/collision issues that happen during continuous bidirectional renegotiations.
