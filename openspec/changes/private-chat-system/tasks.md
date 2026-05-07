## 1. Chat Service Foundation (Backend)

- [x] 1.1 Create `backend/chat-service` directory and initialize with `npm init`.
- [x] 1.2 Setup `express` server with `Socket.io` support.
- [x] 1.3 Configure database connection and create migrations/scripts for `conversations` and `messages` tables.
- [x] 1.4 Implement JWT authentication middleware for WebSocket connections and API routes.
- [x] 1.5 Add `chat-service` to `docker-compose.yml` and configure networking/gateway.

## 2. Messaging Logic & API

- [x] 2.1 Implement `GET /conversations` to fetch a user's chat history.
- [x] 2.2 Implement `GET /conversations/:id/messages` to fetch message history for a specific thread.
- [x] 2.3 Implement Socket.io events for `JOIN_ROOM`, `SEND_MESSAGE`, and `MESSAGE_RECEIVED`.
- [x] 2.4 Add validation to ensure users can only access conversations they are part of.

## 3. Frontend Chat Components

- [x] 3.1 Create a new `useChat` hook to manage WebSocket connection and message state.
- [x] 3.2 Implement `Messages.jsx` page (Inbox) to list all active conversations with previews.
- [x] 3.3 Implement `ChatThread.jsx` component for the actual messaging interface.
- [x] 3.4 Add "Message" button to `SellerCard.jsx` and `Profile.jsx` that links to the chat thread.

## 4. Automated Notifications & Integration

- [x] 4.1 Create an internal endpoint in `chat-service` to allow other services to send system messages.
- [x] 4.2 Update `auction-service` (specifically `endPuja` logic) to call the `chat-service` when an auction is won.
- [x] 4.3 Define the template for the automated winning message and ensure it triggers correctly.

## 5. Polishing & Testing

- [x] 5.1 Add unread message indicators to the Inbox and Navigation bar.
- [x] 5.2 Test the full flow: Win an auction -> Auto-chat created -> User replies -> Real-time notification.
- [x] 5.3 Ensure responsive design for the chat interface on mobile devices.
