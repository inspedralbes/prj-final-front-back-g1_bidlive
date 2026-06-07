## Context

BidLive currently has a live auction chat for each auction room, but no private messaging system. Users need to communicate privately to finalize transaction details, especially after an auction concludes. The system is built on a microservices architecture using Node.js, Express, and React.

## Goals / Non-Goals

**Goals:**
- Implement a dedicated `chat-service` to manage private 1-on-1 conversations.
- Provide a real-time messaging experience using WebSockets.
- Persist message history in a database.
- Create an "Inbox" UI for users to see all their active chats.
- Automatically initiate a chat and send a system message when a user wins an auction.
- Add "Chat" entry points on seller profiles and cards.

**Non-Goals:**
- Group conversations or channels.
- Support for media attachments (images, audio, files).
- Advanced features like read receipts or typing indicators in the MVP.
- Deletion or editing of messages.

## Decisions

- **Microservice Architecture**: A new `chat-service` will be created to isolate chat logic and persistence from the auction and auth services.
- **Communication Protocol**: Use `Socket.io` for real-time bidirectional communication.
- **Data Model**:
    - `conversations`: Stores references to the two participants and the last message timestamp.
    - `messages`: Stores the sender ID, conversation ID, message content, and timestamp.
- **Integration**:
    - The `auction-service` will emit an event (or call a hidden internal endpoint) when an auction is won.
    - The `chat-service` will listen and create/update a conversation between the winner and the seller, injecting an automated message: *"¡Felicidades! Has ganado la subasta [Title] por [Price]€. Ponte en contacto con el vendedor para finalizar los detalles."*
- **Authentication**: Reuse the existing JWT-based authentication. The `chat-service` will validate tokens using the shared `JWT_SECRET`.
- **Frontend**:
    - `Messages.jsx`: A main view listing all conversations.
    - `ChatThread.jsx`: A component for the actual message stream.
    - `ChatButton.jsx`: A reusable component for initiating chats.

## Risks / Trade-offs

- **Synchronization**: Ensuring the automated message is sent correctly even if the winner/seller is offline.
- **Scalability**: WebSocket connections consume more server resources than standard REST requests; however, for the expected user load, a standard Node.js instance should suffice.
- **Complexity**: Adding a new service increases the deployment complexity (docker-compose, networking).
