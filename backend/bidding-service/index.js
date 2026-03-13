require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3002;

// { auctionId: { seller: ws|null, viewers: Map<sessionId, ws>, mutedUsers: Map<username, expireTimeMs> } }
const rooms = new Map();

const sendJson = (ws, data) => {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
};

const broadcastViewerCount = (room) => {
    const count = room.viewers.size;
    const msg = { type: "VIEWER_COUNT", payload: { count } };
    if (room.seller) sendJson(room.seller, msg);
    room.viewers.forEach(v => sendJson(v, msg));
};

const isUserMuted = (room, username, ws) => {
    if (room.mutedUsers.has(username)) {
        const expireTime = room.mutedUsers.get(username);
        if (Date.now() < expireTime) {
            sendJson(ws, {
                type: "SYSTEM",
                payload: {
                    message: "Está silenciado temporalmente y no puede realizar esta acción.",
                    timestamp: new Date().toISOString()
                }
            });
            return true;
        } else {
            room.mutedUsers.delete(username);
        }
    }
    return false;
};

wss.on("connection", (ws) => {
    ws.sessionId = randomUUID();
    sendJson(ws, { type: "SESSION_INIT", payload: { sessionId: ws.sessionId } });

    ws.on("message", (raw) => {
        try {
            const { type, payload } = JSON.parse(raw);

            switch (type) {
                case "JOIN_ROOM": {
                    const { auctionId, username, role, userId } = payload;
                    ws.auctionId = auctionId;
                    ws.username = username;
                    ws.userId = userId;
                    ws.role = role === "seller" ? "seller" : "viewer";

                    if (!rooms.has(auctionId)) rooms.set(auctionId, { seller: null, viewers: new Map(), mutedUsers: new Map() });
                    const room = rooms.get(auctionId);

                    if (ws.role === "seller") {
                        room.seller = ws;
                        console.log(`[Room ${auctionId}] Seller joined [${ws.sessionId}]`);
                    } else {
                        room.viewers.set(ws.sessionId, ws);
                        console.log(`[Room ${auctionId}] Viewer joined [${ws.sessionId}]`);
                    }
                    broadcastViewerCount(room);
                    break;
                }

                case "CHAT_MESSAGE": {
                    const room = rooms.get(ws.auctionId);
                    if (!room) break;

                    const username = ws.username || "Anonymous";
                    if (isUserMuted(room, username, ws)) break;

                    const msg = { type: "CHAT_MESSAGE", payload: { id: randomUUID(), username: username, message: payload.message, timestamp: new Date().toISOString(), senderId: ws.role } };
                    if (room.seller) sendJson(room.seller, msg);
                    room.viewers.forEach(v => sendJson(v, msg));
                    break;
                }

                case "DELETE_MESSAGE": {
                    const room = rooms.get(ws.auctionId);
                    if (!room || ws.role !== "seller") break;
                    // Broadcast DELETE_MESSAGE with the target messageId
                    const delMsg = { type: "MESSAGE_DELETED", payload: { messageId: payload.messageId } };
                    console.log(`[Room ${ws.auctionId}] Moderation: Seller deleted message ${payload.messageId}`);
                    if (room.seller) sendJson(room.seller, delMsg);
                    room.viewers.forEach(v => sendJson(v, delMsg));
                    break;
                }

                case "MUTE_USER": {
                    const room = rooms.get(ws.auctionId);
                    if (!room || ws.role !== "seller") break;

                    const targetUsername = payload.username;
                    const durationMs = (payload.durationMinutes || 5) * 60 * 1000;
                    room.mutedUsers.set(targetUsername, Date.now() + durationMs);

                    console.log(`[Room ${ws.auctionId}] Moderation: Seller muted user ${targetUsername} for ${payload.durationMinutes} minutes`);

                    // Notify everyone (so ChatSidebar can handle local UI if username matches)
                    const muteMsg = { type: "USER_MUTED", payload: { username: targetUsername, durationMinutes: payload.durationMinutes } };
                    if (room.seller) sendJson(room.seller, muteMsg);
                    room.viewers.forEach(v => sendJson(v, muteMsg));
                    break;
                }

                case "PLACE_BID": {
                    const room = rooms.get(ws.auctionId);
                    if (!room) break;

                    const username = ws.username || "Anonymous";
                    if (isUserMuted(room, username, ws)) break;

                    const msg = { 
                        type: "BID_PLACED", 
                        payload: { 
                            id: randomUUID(), 
                            username: username, 
                            userId: ws.userId, 
                            amount: payload.amount, 
                            timestamp: new Date().toISOString() 
                        } 
                    };
                    if (room.seller) sendJson(room.seller, msg);
                    room.viewers.forEach(v => sendJson(v, msg));
                    break;
                }

                // ── WebRTC Signaling ───────────────────────────────────────────

                // Seller → all viewers: "I'm live now, please request an offer"
                case "SELLER_LIVE": {
                    const room = rooms.get(ws.auctionId);
                    if (!room || ws.role !== "seller") break;
                    console.log(`[Room ${ws.auctionId}] SELLER_LIVE broadcast → ${room.viewers.size} viewer(s)`);
                    room.viewers.forEach(v => sendJson(v, { type: "SELLER_LIVE", payload: {} }));
                    break;
                }

                // Viewer → seller only (includes fromId = viewer's sessionId)
                case "REQUEST_OFFER": {
                    const room = rooms.get(ws.auctionId);
                    if (!room || !room.seller) { console.log(`[Room ${ws.auctionId}] REQUEST_OFFER but no seller`); break; }
                    console.log(`[Room ${ws.auctionId}] REQUEST_OFFER viewer[${ws.sessionId}] → seller`);
                    sendJson(room.seller, { type: "REQUEST_OFFER", payload: { fromId: ws.sessionId, from: ws.username } });
                    break;
                }

                // Seller → specific viewer (targetId) or all viewers
                case "OFFER": {
                    const room = rooms.get(ws.auctionId);
                    if (!room) break;
                    const targetId = payload?.targetId;
                    const offerMsg = { type: "OFFER", payload: { sdp: payload.sdp } };
                    if (targetId) {
                        const target = room.viewers.get(targetId);
                        if (target) { sendJson(target, offerMsg); console.log(`[Room ${ws.auctionId}] OFFER seller → viewer[${targetId}]`); }
                        else console.warn(`[Room ${ws.auctionId}] OFFER target viewer[${targetId}] not found`);
                    } else {
                        room.viewers.forEach(v => sendJson(v, offerMsg));
                        console.log(`[Room ${ws.auctionId}] OFFER seller → all ${room.viewers.size} viewer(s)`);
                    }
                    break;
                }

                // Viewer → seller (fromId so seller knows which PeerConnection)
                case "ANSWER": {
                    const room = rooms.get(ws.auctionId);
                    if (!room || !room.seller) break;
                    console.log(`[Room ${ws.auctionId}] ANSWER viewer[${ws.sessionId}] → seller`);
                    sendJson(room.seller, { type: "ANSWER", payload: { sdp: payload.sdp, fromId: ws.sessionId } });
                    break;
                }

                // ICE: seller→viewers (targeted or all), viewer→seller
                case "ICE_CANDIDATE": {
                    const room = rooms.get(ws.auctionId);
                    if (!room) break;
                    if (ws.role === "seller") {
                        const targetId = payload?.targetId;
                        const iceMsg = { type: "ICE_CANDIDATE", payload: { candidate: payload.candidate } };
                        if (targetId) { const t = room.viewers.get(targetId); if (t) sendJson(t, iceMsg); }
                        else room.viewers.forEach(v => sendJson(v, iceMsg));
                    } else {
                        if (room.seller) sendJson(room.seller, { type: "ICE_CANDIDATE", payload: { candidate: payload.candidate, fromId: ws.sessionId } });
                    }
                    break;
                }

                // Seller ends auction → broadcast AUCTION_ENDED to all
                case "END_AUCTION": {
                    const room = rooms.get(ws.auctionId);
                    if (!room || ws.role !== "seller") break;
                    console.log(`[Room ${ws.auctionId}] END_AUCTION → broadcasting AUCTION_ENDED`);
                    const endMsg = { type: "AUCTION_ENDED", payload: { auctionId: ws.auctionId, ...payload } };
                    if (room.seller) sendJson(room.seller, endMsg);
                    room.viewers.forEach(v => sendJson(v, endMsg));
                    break;
                }

                case "PING":
                    sendJson(ws, { type: "PONG" });
                    break;

                default:
                    console.log("Unknown message type:", type);
            }
        } catch (err) {
            console.error("Message parse error:", err);
        }
    });

    ws.on("close", () => {
        if (!ws.auctionId) return;
        const room = rooms.get(ws.auctionId);
        if (!room) return;
        if (ws.role === "seller") {
            room.seller = null;
            room.viewers.forEach(v => sendJson(v, { type: "SELLER_LEFT", payload: {} }));
            console.log(`[Room ${ws.auctionId}] Seller disconnected`);
        } else {
            room.viewers.delete(ws.sessionId);
            console.log(`[Room ${ws.auctionId}] Viewer[${ws.sessionId}] disconnected`);
        }
        broadcastViewerCount(room);
        if (!room.seller && room.viewers.size === 0) { rooms.delete(ws.auctionId); console.log(`[Room ${ws.auctionId}] deleted (empty)`); }
    });
});

server.listen(PORT, () => console.log(`Bidding Service on port ${PORT}`));
