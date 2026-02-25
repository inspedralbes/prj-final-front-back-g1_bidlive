require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3002;

// Structure for room management
// { auctionId: { sellerId: ws, viewers: Set<ws> } }
const rooms = new Map();

// Helper to send JSON
const sendJson = (ws, data) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;

      switch (type) {
        case "JOIN_ROOM": {
          const { auctionId, username, role } = payload;
          ws.auctionId = auctionId;
          ws.username = username;
          ws.role = role || (payload.role === 'seller' ? 'seller' : 'viewer');

          if (!rooms.has(auctionId)) {
            rooms.set(auctionId, { sellerId: null, viewers: new Set() });
          }
          const room = rooms.get(auctionId);

          if (ws.role === "seller") {
            room.sellerId = ws;
          } else {
            room.viewers.add(ws);
          }

          console.log(`User ${username} joined ${auctionId} as ${ws.role}`);

          // Broadcast viewer count
          const count = rooms.get(auctionId).viewers.size;
          const countMsg = { type: "VIEWER_COUNT", payload: { count } };

          if (room.sellerId) sendJson(room.sellerId, countMsg);
          room.viewers.forEach(viewer => sendJson(viewer, countMsg));
          break;
        }

        case "CHAT_MESSAGE": {
          if (ws.auctionId) {
            const room = rooms.get(ws.auctionId);
            if (room) {
              // Structuring the message for the frontend
              // Frontend expects the message object directly in the array?
              // Or wrapped? useWebSocket.js pushes 'data' (the parsed event.data)
              // So we send { type: "CHAT_MESSAGE", payload: { ... } }
              const chatMsg = {
                type: "CHAT_MESSAGE",
                payload: {
                  username: ws.username || "Anonymous",
                  message: payload.message,
                  timestamp: new Date().toISOString(),
                  senderId: ws.role === 'seller' ? 'seller' : 'viewer' // Simplified ID
                }
              };

              if (room.sellerId) sendJson(room.sellerId, chatMsg);
              room.viewers.forEach(viewer => sendJson(viewer, chatMsg));
            }
          }
          break;
        }

        case "PLACE_BID": {
          if (ws.auctionId) {
            const room = rooms.get(ws.auctionId);
            if (room) {
              const bidMsg = {
                type: "BID_PLACED",
                payload: {
                  username: ws.username || "Anonymous",
                  amount: payload.amount,
                  timestamp: new Date().toISOString()
                }
              };
              if (room.sellerId) sendJson(room.sellerId, bidMsg);
              room.viewers.forEach(viewer => sendJson(viewer, bidMsg));
            }
          }
          break;
        }

        case "OFFER":
        case "ANSWER":
        case "ICE_CANDIDATE": {
          // Signaling forwarding
          if (ws.auctionId) {
            const room = rooms.get(ws.auctionId);
            if (room) {
              const signalMsg = { type, payload: { ...payload, from: ws.username } };

              // Very basic broadcasting for signaling (inefficient but matches basic logic)
              // Ideally strict P2P targeting
              if (room.sellerId && room.sellerId !== ws) sendJson(room.sellerId, signalMsg);
              room.viewers.forEach(viewer => {
                if (viewer !== ws) sendJson(viewer, signalMsg);
              });
            }
          }
          break;
        }

        default:
          console.log("Unknown message type:", type);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    if (ws.auctionId) {
      const room = rooms.get(ws.auctionId);
      if (room) {
        if (room.sellerId === ws) {
          room.sellerId = null;
          console.log(`Seller left room ${ws.auctionId}`);
        } else {
          room.viewers.delete(ws);
          console.log(`Viewer left room ${ws.auctionId}`);
        }

        // Broadcast new count
        const count = room.viewers.size;
        const countMsg = { type: "VIEWER_COUNT", payload: { count } };
        if (room.sellerId) sendJson(room.sellerId, countMsg);
        room.viewers.forEach(viewer => sendJson(viewer, countMsg));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Bidding (Signaling) Service listening on port ${PORT}`);
});
