## ADDED Requirements

### Requirement: Real-time notification delivery via WebSocket
The system must deliver notifications instantly to online users using the WebSocket infrastructure.

#### Scenario: Real-time delivery to online user
- **WHEN** a new notification is created for a user who is currently connected to the WebSocket.
- **THEN** a `NOTIFICATION` event must be emitted specifically to that user's socket.

### Requirement: Global presence monitoring
The `bidding-service` must track which users are online (not just in a specific auction room) to route notifications correctly.

#### Scenario: User registration in notification namespace
- **WHEN** a user logs into the frontend.
- **THEN** the client must establish a connection to the notifications namespace and provide its `userId`.
