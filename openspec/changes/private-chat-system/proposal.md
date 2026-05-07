## Why

The current platform lacks a direct communication channel between users. To improve the user experience and facilitate transaction finalization, it is essential that buyers and sellers can talk to each other. This is especially important after an auction ends, as users need to coordinate payment (if not automated) or shipping details. Additionally, having a record of these conversations within the platform increases safety and trust.

## What Changes

- **Backend**: Creation of a new `chat-service` microservice. This service will handle real-time messaging using WebSockets, store conversation history, and manage chat participants.
- **Frontend**:
    - A new "Messages" section in the user dashboard/profile to view and manage all active chats.
    - A chat window/overlay for real-time conversation.
    - "Message" buttons on seller cards and profile pages to initiate chats.
- **Integration**: Modification of the auction closure process to automatically trigger a message in the private chat between the winner and the seller when an auction is completed.

## Capabilities

### New Capabilities
- `private-messaging`: Real-time direct messaging between any two registered users.
- `chat-inbox`: A central location for users to see their conversation history and latest messages.
- `automated-transaction-notifications`: Automated system messages sent to a chat thread when a user wins an auction from a seller.

### Modified Capabilities
- `auction-closure`: The process of ending an auction will now include a trigger to notify the chat service.
