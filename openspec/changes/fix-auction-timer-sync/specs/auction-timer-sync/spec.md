## ADDED Requirements

### Requirement: Synchronized Server-Relative Timer
The system SHALL display an identical countdown timer to all viewers and the seller, regardless of their local system clock settings.

#### Scenario: User joins an ongoing auction
- **WHEN** a viewer or seller joins an auction that is currently live
- **THEN** the system calculates the remaining time using the server's time offset
- **THEN** the UI displays exactly the same time remaining across all connected devices

### Requirement: Anti-sniping Time Extension
The system SHALL extend the auction's end time if a valid bid is placed in the final moments of the auction to prevent last-second sniping.

#### Scenario: Bid placed in the last 30 seconds
- **WHEN** a user successfully places a bid
- **AND** the auction's remaining time is 30 seconds or less
- **THEN** the system adds 30 seconds to the auction's current end time
- **THEN** the system broadcasts the new end time to all clients via WebSocket

#### Scenario: Bid placed before the last 30 seconds
- **WHEN** a user successfully places a bid
- **AND** the auction's remaining time is strictly greater than 30 seconds
- **THEN** the system accepts the bid without modifying the auction's end time

### Requirement: Automated Auction Closure
The system SHALL enforce strict closing of the auction when the remaining time reaches exactly zero.

#### Scenario: Timer reaches zero
- **WHEN** the backend closure worker detects the auction has expired
- **THEN** the auction status is updated to 'ended'
- **THEN** the system stops accepting any new bids for this auction
- **THEN** all clients receive a WebSocket event terminating the stream and locking the UI

#### Scenario: Timer reaches zero without any bids
- **WHEN** the backend closure worker detects the auction has expired
- **AND** no bids were placed during the auction
- **THEN** the auction is marked as ended without a winner
- **THEN** the auction is permanently saved in the system's history for record-keeping
- **THEN** all clients receive a WebSocket event displaying the "Subasta Desierta" state
