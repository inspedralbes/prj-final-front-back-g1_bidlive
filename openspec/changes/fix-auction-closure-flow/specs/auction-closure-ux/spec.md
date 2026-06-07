## ADDED Requirements

### Requirement: Persistent Closure UI
The system SHALL present a permanent end-of-auction overlay to both the seller and the viewers when the auction time runs out, requiring manual interaction to dismiss.

#### Scenario: Seller sees the end of the auction
- **WHEN** the auction ends (`AUCTION_ENDED` event)
- **THEN** the camera stream cleanly shuts down
- **THEN** the seller is presented with an overlay detailing the winner (or "Subasta Desierta") and the final price
- **THEN** the system does NOT force redirect the seller, providing a button to "Return to Dashboard" instead

#### Scenario: Viewers see the end of the auction
- **WHEN** the auction ends (`AUCTION_ENDED` event)
- **THEN** the viewer sees the winner or "Desierta" overlay
- **THEN** the viewer is NOT forced to leave the page automatically after 5 seconds

### Requirement: Pre-stream WebRTC Renegotiation
The system SHALL dynamically renegotiate existing WebRTC connections when the seller starts broadcasting.

#### Scenario: Viewer connects early
- **WHEN** a viewer joins the room before the seller clicks "Go Live"
- **THEN** a peer connection is established without a video track
- **WHEN** the seller clicks "Go Live"
- **THEN** the new camera tracks are added to the existing peer connection
- **THEN** a new Offer is generated and sent to the viewer to trigger a seamless video playback start
