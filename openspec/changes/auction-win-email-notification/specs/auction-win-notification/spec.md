## ADDED Requirements

### Requirement: Send Auction Win Email
The system SHALL send an automated confirmation email to the user who placed the highest valid bid when an auction successfully ends.

#### Scenario: User wins an auction
- **WHEN** an auction's duration expires and there is a valid highest bid
- **THEN** the system identifies the user who placed the highest bid
- **AND** the system sends an email to that user containing the item details and the winning bid amount
- **AND** the system logs the email sending event

#### Scenario: Auction ends with no bids
- **WHEN** an auction's duration expires and there are zero bids
- **THEN** the system does NOT send any winning confirmation email
