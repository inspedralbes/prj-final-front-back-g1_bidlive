require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const { randomUUID } = require("crypto");
const db = require('./config/db');

const app = express();
// app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3002;

// Initialize live_messages table for persistent chat
db.query(`
    CREATE TABLE IF NOT EXISTS live_messages (
        id VARCHAR(36) PRIMARY KEY,
        auction_id VARCHAR(64) NOT NULL,
        username VARCHAR(255) NOT NULL,
        sender_id VARCHAR(64) DEFAULT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_auction_id (auction_id)
    )
`).then(() => {
    console.log('[BiddingDB] live_messages table ready.');
}).catch(err => {
    console.error('[BiddingDB] Failed to create live_messages table:', err.message);
});

// { auctionId: { seller: ws|null, viewers: Map<sessionId, ws>, mutedUsers: Map<username, expireTimeMs> } }
const rooms = new Map();
// { userId: Set<ws> }  -- A user can have multiple sockets open
const userSockets = new Map();

const sendJson = (ws, data) => {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
};

const broadcastViewerCount = (room) => {
    const count = room.viewers.size;
    const msg = { type: "VIEWER_COUNT", payload: { count } };
    if (room.seller) sendJson(room.seller, msg);
    room.viewers.forEach(v => sendJson(v, msg));
};

const createAndSendNotification = async (userId, title, message, type, link) => {
    try {
        const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
        const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';
        const BIDDING_URL = process.env.BIDDING_SERVICE_URL || 'http://bidding-service:3002';

        // 1. Persist in Auth Service
        await fetch(`${AUTH_URL}/notifications/internal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                internal_secret: INTERNAL_SECRET,
                user_id: userId,
                title,
                message,
                type,
                link
            })
        });

        // 2. Deliver via WebSockets if connected
        const sockets = userSockets.get(userId);
        if (sockets && sockets.size > 0) {
            const wsMsg = { 
                type: "NOTIFICATION", 
                payload: { title, message, type, link, timestamp: new Date().toISOString() } 
            };
            sockets.forEach(s => sendJson(s, wsMsg));
        }
    } catch (err) {
        console.error('[NotificationHelper] Failed to process notification:', err.message);
    }
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

    ws.on("message", async (raw) => {
        try {
            const { type, payload } = JSON.parse(raw);

            switch (type) {
                case "REGISTER_USER": {
                    const { userId } = payload;
                    if (!userId) break;
                    ws.userId = userId;
                    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
                    userSockets.get(userId).add(ws);
                    console.log(`[Global] User ${userId} registered socket ${ws.sessionId}`);
                    break;
                }

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

                    // Stream last 100 historical messages to the newly connected socket
                    try {
                        const history = await db.query(
                            'SELECT * FROM live_messages WHERE auction_id = ? ORDER BY timestamp ASC LIMIT 100',
                            [auctionId]
                        );
                        const rows = Array.isArray(history[0]) ? history[0] : history;
                        rows.forEach(row => {
                            sendJson(ws, {
                                type: 'CHAT_MESSAGE',
                                payload: {
                                    id: row.id,
                                    username: row.username,
                                    message: row.message,
                                    timestamp: row.timestamp,
                                    senderId: row.sender_id,
                                    historical: true,
                                }
                            });
                        });
                        if (rows.length > 0) console.log(`[Room ${auctionId}] Streamed ${rows.length} historical messages to [${ws.sessionId}]`);
                    } catch (histErr) {
                        console.error(`[BiddingDB] Failed to stream chat history for room ${auctionId}:`, histErr.message);
                    }

                    // Send current end_time so all clients have the same synchronized timer
                    try {
                        const AUCTION_SERVICE_URL = process.env.AUCTION_SERVICE_URL || 'http://auction-service:3001';
                        const auctionRes = await fetch(`${AUCTION_SERVICE_URL}/pujas/${auctionId}`);
                        if (auctionRes.ok) {
                            const auctionData = await auctionRes.json();
                            if (auctionData.end_time) {
                                sendJson(ws, { type: 'NEW_END_TIME', payload: { endTime: auctionData.end_time } });
                                console.log(`[Room ${auctionId}] Sent end_time ${auctionData.end_time} to [${ws.sessionId}]`);
                            }
                        }
                    } catch (etErr) {
                        console.error(`[BiddingDB] Failed to send end_time to [${ws.sessionId}]:`, etErr.message);
                    }
                    break;
                }

                case "CHAT_MESSAGE": {
                    const room = rooms.get(ws.auctionId);
                    if (!room) break;

                    const username = ws.username || "Anonymous";
                    if (isUserMuted(room, username, ws)) break;

                    const msgId = randomUUID();
                    const msg = { type: "CHAT_MESSAGE", payload: { id: msgId, username: username, message: payload.message, timestamp: new Date().toISOString(), senderId: ws.role } };
                    if (room.seller) sendJson(room.seller, msg);
                    room.viewers.forEach(v => sendJson(v, msg));

                    // Persist to database
                    try {
                        await db.query(
                            'INSERT INTO live_messages (id, auction_id, username, sender_id, message) VALUES (?, ?, ?, ?, ?)',
                            [msgId, ws.auctionId, username, ws.userId || null, payload.message]
                        );
                    } catch (dbErr) {
                        console.error('[BiddingDB] Failed to persist chat message:', dbErr.message);
                    }
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

                    // Delete from database
                    try {
                        await db.query('DELETE FROM live_messages WHERE id = ? AND auction_id = ?', [payload.messageId, ws.auctionId]);
                    } catch (dbErr) {
                        console.error('[BiddingDB] Failed to delete chat message:', dbErr.message);
                    }
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
                    if (!ws.userId) {
                        sendJson(ws, { type: "ERROR", payload: { message: "Debes estar identificado para pujar." } });
                        break;
                    }

                    const username = ws.username || "Anonymous";
                    if (isUserMuted(room, username, ws)) break;

                    const AUCTION_SERVICE_URL = process.env.AUCTION_SERVICE_URL || 'http://auction-service:3001';
                    const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
                    const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';

                    try {
                        // 1. Validaciones en paralelo (Precio actual y Saldo)
                        const [auctionRes, balanceRes] = await Promise.all([
                            fetch(`${AUCTION_SERVICE_URL}/pujas/${ws.auctionId}`),
                            fetch(`${AUTH_URL}/wallet/balance/${ws.userId}?secret=${INTERNAL_SECRET}`)
                        ]);

                        const auction = await auctionRes.json();
                        const balanceData = await balanceRes.json();
                        const balance = balanceData.balance || 0;

                        // 1a. Cierre Estricto
                        const now = new Date();
                        const endTime = new Date(auction.end_time);
                        if (now >= endTime || auction.status === 'ended') {
                            sendJson(ws, { type: "ERROR", payload: { message: "La subasta ha finalizado." } });
                            break;
                        }

                        // 1b. Validación de Saldo
                        if (balance < payload.amount) {
                            sendJson(ws, { type: "ERROR", payload: { message: "Saldo insuficiente. Recarga para poder pujar." } });
                            break;
                        }

                        // 1c. Incrementos Dinámicos
                        const currentPrice = Number(auction.current_price);
                        const startingPrice = Number(auction.starting_price);
                        const hasBids = auction.last_bidder_id !== null;

                        let minIncrement = 1;
                        if (currentPrice >= 500) minIncrement = 10;
                        else if (currentPrice >= 100) minIncrement = 5;

                        // Si no hay pujas, el mínimo es el precio de salida. 
                        // Si hay pujas, el mínimo es precio actual + incremento.
                        const minRequired = hasBids ? (currentPrice + minIncrement) : startingPrice;

                        if (payload.amount < minRequired) {
                            sendJson(ws, { 
                                type: "ERROR", 
                                payload: { 
                                    message: `La puja mínima es de ${Math.ceil(minRequired)}€.` 
                                } 
                            });
                            break;
                        }

                        // 2. Registrar puja
                        const bidResp = await fetch(`${AUCTION_SERVICE_URL}/pujas/${ws.auctionId}/bid`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ bidderId: ws.userId, amount: payload.amount, secret: INTERNAL_SECRET })
                        });
                        const bidData = await bidResp.json();

                        if (!bidData.success) {
                            sendJson(ws, { type: "ERROR", payload: { message: "Error al registrar la puja." } });
                            break;
                        }

                        // 3. Anti-sniping: Extender si queda menos de 60s
                        const secondsLeft = (endTime - now) / 1000;
                        if (secondsLeft < 60) {
                            console.log(`[AntiSniping] Extending auction ${ws.auctionId} (+30s)`);
                            const extResp = await fetch(`${AUCTION_SERVICE_URL}/pujas/${ws.auctionId}/extend`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ seconds: 30, secret: INTERNAL_SECRET })
                            });
                            const extData = await extResp.json();
                            if (extData.success) {
                                const extMsg = { 
                                    type: "SYSTEM", 
                                    payload: { message: "¡Emoción en el último minuto! Tiempo extendido +30s", timestamp: new Date().toISOString() } 
                                };
                                if (room.seller) sendJson(room.seller, extMsg);
                                room.viewers.forEach(v => sendJson(v, extMsg));
                                
                                // Broadcast NEW_END_TIME
                                const timeMsg = { type: "NEW_END_TIME", payload: { endTime: extData.newEndTime } };
                                if (room.seller) sendJson(room.seller, timeMsg);
                                room.viewers.forEach(v => sendJson(v, timeMsg));
                            }
                        }

                        // 4. Notificar éxito y outbid
                        const msg = { 
                            type: "BID_PLACED", 
                            payload: { id: randomUUID(), username, userId: ws.userId, amount: payload.amount, timestamp: new Date().toISOString() } 
                        };
                        if (room.seller) sendJson(room.seller, msg);
                        room.viewers.forEach(v => sendJson(v, msg));

                        if (bidData.previousBidderId && bidData.previousBidderId !== ws.userId) {
                            createAndSendNotification(
                                bidData.previousBidderId,
                                '¡Han superado tu puja!',
                                `Alguien ha pujado ${payload.amount}€ en la subasta #${ws.auctionId}.`,
                                'outbid',
                                `/auction/video/${ws.auctionId}`
                            );
                        }

                    } catch (err) {
                        console.error('[BiddingService] Bid Error:', err.message);
                        sendJson(ws, { type: "ERROR", payload: { message: "Error procesando la puja." } });
                    }
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
        if (ws.userId && userSockets.has(ws.userId)) {
            const sockets = userSockets.get(ws.userId);
            sockets.delete(ws);
            if (sockets.size === 0) userSockets.delete(ws.userId);
        }

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

app.use(express.json());

app.post("/broadcast", (req, res) => {
    const { auctionId, type, payload, secret } = req.body;
    if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const room = rooms.get(auctionId);
    if (room) {
        const msg = { type, payload };
        if (room.seller) sendJson(room.seller, msg);
        room.viewers.forEach(v => sendJson(v, msg));
        return res.json({ success: true });
    }
    res.status(404).json({ message: 'Room not found' });
});

app.post("/inject-chat", async (req, res) => {
    const { auctionId, message, username, senderId, secret } = req.body;
    if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const msgId = randomUUID();
        const timestamp = new Date().toISOString();
        const chatMsg = { 
            type: "CHAT_MESSAGE", 
            payload: { id: msgId, username, message, timestamp, senderId: senderId || 'system' } 
        };

        const room = rooms.get(auctionId);
        if (room) {
            if (room.seller) sendJson(room.seller, chatMsg);
            room.viewers.forEach(v => sendJson(v, chatMsg));
        }

        // Persist to database even if room is empty (for history)
        await db.query(
            'INSERT INTO live_messages (id, auction_id, username, sender_id, message) VALUES (?, ?, ?, ?, ?)',
            [msgId, auctionId, username, senderId || 'system', message]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('[BiddingService] Failed to inject chat:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/notify-user", (req, res) => {
    const { userId, type, payload, secret } = req.body;
    if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const sockets = userSockets.get(userId);
    if (sockets && sockets.size > 0) {
        const msg = { type: type || 'NOTIFICATION', payload };
        sockets.forEach(s => sendJson(s, msg));
        return res.json({ success: true, delivered: sockets.size });
    }
    res.json({ success: false, message: 'User not connected' });
});

app.post("/notify-users", (req, res) => {
    const { userIds, type, payload, secret } = req.body;
    if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (!Array.isArray(userIds)) {
        return res.status(400).json({ message: 'userIds must be an array' });
    }

    let deliveredCount = 0;
    userIds.forEach(uid => {
        const sockets = userSockets.get(uid);
        if (sockets && sockets.size > 0) {
            const msg = { type: type || 'NOTIFICATION', payload };
            sockets.forEach(s => sendJson(s, msg));
            deliveredCount += sockets.size;
        }
    });

    res.json({ success: true, delivered: deliveredCount });
});

server.listen(PORT, () => console.log(`Bidding Service on port ${PORT}`));
