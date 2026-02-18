const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

const PORT = process.env.PORT || 3002;

// Estructures per a gestió d'habitacions (rooms)
// { auctionId: { sellerId: string, viewers: Set<string> } }
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", ({ auctionId, role }) => {
    socket.join(auctionId);
    console.log(`User ${socket.id} joined room ${auctionId} as ${role}`);

    if (!rooms.has(auctionId)) {
      rooms.set(auctionId, { sellerId: null, viewers: new Set() });
    }
    const room = rooms.get(auctionId);

    if (role === "seller") {
      room.sellerId = socket.id;
    } else {
      room.viewers.add(socket.id);
      // Notificar al venedor que hi ha un nou espectador
      if (room.sellerId) {
        io.to(room.sellerId).emit("viewer-joined", { viewerId: socket.id });
      }
    }

    // Actualitzar comptador d'espectadors a tots
    io.to(auctionId).emit("viewer-count", { count: room.viewers.size });
  });

  socket.on("offer", ({ auctionId, to, sdp }) => {
    console.log(`Offer from ${socket.id} to ${to}`);
    io.to(to).emit("offer", { from: socket.id, sdp });
  });

  socket.on("answer", ({ auctionId, to, sdp }) => {
    console.log(`Answer from ${socket.id} to ${to}`);
    io.to(to).emit("answer", { from: socket.id, sdp });
  });

  socket.on("ice-candidate", ({ auctionId, candidate, to }) => {
    // Si 'to' no està definit, vol dir que estem enviant el candidat a tots els altres de la sala
    // Però en WebRTC P2P normalment ho enviem a un 'peer' específic.
    // En el nostre VideoPlayer.jsx actual, el seller ho envia sense 'to' especificat? No, anem a veure el VideoPlayer.jsx.
    
    if (to) {
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    } else {
      socket.to(auctionId).emit("ice-candidate", { from: socket.id, candidate });
    }
  });

  socket.on("disconnecting", () => {
    for (const auctionId of socket.rooms) {
      const room = rooms.get(auctionId);
      if (room) {
        if (room.sellerId === socket.id) {
          room.sellerId = null;
          console.log(`Seller ${socket.id} left room ${auctionId}`);
        } else {
          room.viewers.delete(socket.id);
          console.log(`Viewer ${socket.id} left room ${auctionId}`);
        }
        io.to(auctionId).emit("viewer-count", { count: room.viewers.size });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Bidding (Signaling) Service listening on port ${PORT}`);
});
