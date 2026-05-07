## ADDED Requirements

### Requirement: Real-time Messaging
Users must be able to send and receive text messages in real-time.

#### Scenario: Sending a message
- **WHEN** a user types a message and clicks send in an active chat thread
- **THEN** the message is immediately delivered to the recipient if they are online, and stored in the database for later retrieval.

### Requirement: Conversation Initialization
Users must be able to start a new chat from a seller's profile or auction card.

#### Scenario: Initiating a chat
- **WHEN** a user clicks the "Message" button on a seller's profile
- **THEN** they are redirected to a chat thread with that seller, creating a new conversation record if one didn't already exist.

### Requirement: Secure Access
Only the two participants of a conversation should be able to see its messages.

#### Scenario: Unauthorized access attempt
- **WHEN** a user tries to fetch messages for a conversation they are not part of
- **THEN** the server returns an unauthorized error.
