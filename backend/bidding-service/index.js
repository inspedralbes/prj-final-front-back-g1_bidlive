const WebSocket = require('ws');
const db = require('./config/db');
require('dotenv').config();

const port = process.env.PORT || 3002;
const wss = new WebSocket.Server({ port });

// ─── Bidding: clients & rooms ───────────────────────────────────────────────
// Map: ws -> { auctionId, username, userId }
const clients = new Map();
// Map: auctionId -> Set(ws)
const biddingRooms = new Map();

// ─── WebRTC Signaling: rooms ─────────────────────────────────────────────────
// Map: auctionId -> { sellerId: socketId|null, viewers: Map<socketId, ws> }
const signalingRooms = new Map();
// Map: ws -> { socketId, auctionId, role }
const signalingClients = new Map();

let socketIdCounter = 0;

// ─── Database init ───────────────────────────────────────────────────────────
const initDB = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS bids (
            id INT AUTO_INCREMENT PRIMARY KEY,
            puja_id INT NOT NULL,
            user_id INT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (puja_id) REFERENCES pujas(id) ON DELETE CASCADE
        )
    `;
    try {
        await db.query(sql);
        console.log('Bids table created or already exists');
    } catch (error) {
        console.error('Error creating bids table:', error);
    }
};

initDB();

// ─── Helper: send JSON ────────────────────────────────────────────────────────
const send = (ws, obj) => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(obj));
    }
};

// ─── Helper: broadcast to a bidding room ─────────────────────────────────────
const broadcastRoom = (auctionId, obj) => {
    if (biddingRooms.has(auctionId)) {
        biddingRooms.get(auctionId).forEach(client => send(client, obj));
    }
};

// ─── Helper: update viewer count ─────────────────────────────────────────────
const broadcastViewerCount = (auctionId) => {
    const room = signalingRooms.get(auctionId);
    if (!room) return;
    const count = room.viewers.size;
    // Send to all ws in the bidding room for this auction too
    broadcastRoom(auctionId, { type: 'VIEWER_COUNT', payload: { count } });
    // Also send to signaling clients in this auction
    room.viewers.forEach(ws => send(ws, { type: 'viewer-count', count }));
    if (room.sellerWs) send(room.sellerWs, { type: 'viewer-count', count });
};

// ─── Connection handler ───────────────────────────────────────────────────────
wss.on('connection', (ws) => {
    const socketId = `sid_${++socketIdCounter}`;
    console.log(`Client connected: ${socketId}`);

    ws.on('message', async (raw) => {
        let data;
        try {
            data = JSON.parse(raw);
        } catch {
            return;
        }

        const { type, payload } = data;

        switch (type) {

            // ══════════════════════════════════════════════════════════════
            // BIDDING MESSAGES
            // ══════════════════════════════════════════════════════════════

            case 'JOIN_ROOM': {
                const { auctionId, username, userId } = payload;

                // Leave old bidding room
                if (clients.has(ws)) {
                    const { auctionId: oldId } = clients.get(ws);
                    if (biddingRooms.has(oldId)) {
                        biddingRooms.get(oldId).delete(ws);
                        if (biddingRooms.get(oldId).size === 0) biddingRooms.delete(oldId);
                    }
                }

                clients.set(ws, { auctionId, username, userId });
                if (!biddingRooms.has(auctionId)) biddingRooms.set(auctionId, new Set());
                biddingRooms.get(auctionId).add(ws);

                console.log(`${username} joined bidding room ${auctionId}`);

                try {
                    const [auction] = await db.query(
                        'SELECT current_price, starting_price, seller_id FROM pujas WHERE id = ?',
                        [auctionId]
                    );
                    const currentPrice = auction ? (auction.current_price || auction.starting_price) : 0;
                    send(ws, {
                        type: 'AUCTION_UPDATE',
                        payload: {
                            currentPrice: parseFloat(currentPrice),
                            sellerId: auction?.seller_id,
                            message: `Connected. Current price: €${currentPrice}`
                        },
                        timestamp: new Date().toISOString()
                    });
                } catch (err) {
                    console.error('DB error on JOIN_ROOM:', err);
                }
                break;
            }

            case 'CHAT_MESSAGE': {
                if (!clients.has(ws)) break;
                const { auctionId, username: senderName } = clients.get(ws);
                broadcastRoom(auctionId, {
                    type: 'CHAT_MESSAGE',
                    payload: { username: senderName, message: payload.message, isSystem: false },
                    timestamp: new Date().toISOString()
                });
                break;
            }

            case 'PLACE_BID': {
                if (!clients.has(ws)) break;
                const { auctionId, username: bidderName, userId: bidderId } = clients.get(ws);
                const bidAmount = parseFloat(payload.amount);

                try {
                    const [auction] = await db.query(
                        'SELECT current_price, starting_price, seller_id FROM pujas WHERE id = ?',
                        [auctionId]
                    );
                    if (!auction) { send(ws, { type: 'ERROR', payload: { message: 'Auction not found' } }); break; }

                    const currentPrice = parseFloat(auction.current_price || auction.starting_price);
                    if (bidAmount <= currentPrice) {
                        send(ws, { type: 'ERROR', payload: { message: `Bid must be higher than €${currentPrice}` } });
                        break;
                    }

                    if (bidderId) {
                        await db.query(
                            'INSERT INTO bids (puja_id, user_id, amount) VALUES (?, ?, ?)',
                            [auctionId, bidderId, bidAmount]
                        );
                    }
                    await db.query('UPDATE pujas SET current_price = ? WHERE id = ?', [bidAmount, auctionId]);

                    const ts = new Date().toISOString();
                    broadcastRoom(auctionId, {
                        type: 'AUCTION_UPDATE',
                        payload: { currentPrice: bidAmount, lastBidder: bidderName, message: `${bidderName} bid €${bidAmount}` },
                        timestamp: ts
                    });
                    broadcastRoom(auctionId, {
                        type: 'BID_PLACED',
                        payload: { username: bidderName, amount: bidAmount },
                        timestamp: ts
                    });
                } catch (err) {
                    console.error('PLACE_BID error:', err);
                    send(ws, { type: 'ERROR', payload: { message: 'Failed to process bid' } });
                }
                break;
            }

            case 'END_AUCTION': {
                if (!clients.has(ws)) break;
                const { auctionId, userId } = clients.get(ws);

                try {
                    const [auction] = await db.query(
                        'SELECT seller_id, current_price, starting_price FROM pujas WHERE id = ?',
                        [auctionId]
                    );
                    if (!auction) { send(ws, { type: 'ERROR', payload: { message: 'Auction not found' } }); break; }
                    if (!userId || String(userId) !== String(auction.seller_id)) {
                        send(ws, { type: 'ERROR', payload: { message: 'Unauthorized. Only seller can end auction.' } });
                        break;
                    }

                    await db.query("UPDATE pujas SET status = 'ended' WHERE id = ?", [auctionId]);

                    const [lastBid] = await db.query(`
                        SELECT b.amount, u.username
                        FROM bids b JOIN users u ON b.user_id = u.id
                        WHERE b.puja_id = ? ORDER BY b.amount DESC LIMIT 1
                    `, [auctionId]);

                    const finalPrice = auction.current_price || auction.starting_price;
                    const winnerName = lastBid ? lastBid.username : 'No Bids';

                    broadcastRoom(auctionId, {
                        type: 'AUCTION_ENDED',
                        payload: { finalPrice, winner: winnerName, message: `Auction Ended! Winner: ${winnerName} for €${finalPrice}` },
                        timestamp: new Date().toISOString()
                    });
                    console.log(`Auction ${auctionId} ended by seller ${userId}`);
                } catch (err) {
                    console.error('END_AUCTION error:', err);
                    send(ws, { type: 'ERROR', payload: { message: 'Failed to end auction' } });
                }
                break;
            }

            // ══════════════════════════════════════════════════════════════
            // WEBRTC SIGNALING MESSAGES
            // ══════════════════════════════════════════════════════════════

            case 'join-room': {
                const { auctionId, role } = payload;

                // Clean up previous signaling state for this ws
                if (signalingClients.has(ws)) {
                    const { auctionId: oldId, role: oldRole } = signalingClients.get(ws);
                    const oldRoom = signalingRooms.get(oldId);
                    if (oldRoom) {
                        if (oldRole === 'seller') oldRoom.sellerWs = null;
                        else oldRoom.viewers.delete(socketId);
                    }
                }

                signalingClients.set(ws, { socketId, auctionId, role });

                if (!signalingRooms.has(auctionId)) {
                    signalingRooms.set(auctionId, { sellerWs: null, sellerId: null, viewers: new Map() });
                }
                const room = signalingRooms.get(auctionId);

                if (role === 'seller') {
                    room.sellerWs = ws;
                    room.sellerId = socketId;
                    console.log(`Seller ${socketId} joined signaling room ${auctionId}`);
                } else {
                    room.viewers.set(socketId, ws);
                    console.log(`Viewer ${socketId} joined signaling room ${auctionId}`);
                    // Notify seller about new viewer
                    if (room.sellerWs) {
                        send(room.sellerWs, { type: 'viewer-joined', viewerId: socketId });
                    }
                }

                // Send this client their own socket ID
                send(ws, { type: 'connected', socketId });
                broadcastViewerCount(auctionId);
                break;
            }

            case 'offer': {
                const { auctionId, to, sdp } = payload;
                const room = signalingRooms.get(auctionId);
                if (!room) break;
                const targetWs = room.viewers.get(to) || (room.sellerId === to ? room.sellerWs : null);
                if (targetWs) send(targetWs, { type: 'offer', from: socketId, sdp });
                break;
            }

            case 'answer': {
                const { auctionId, to, sdp } = payload;
                const room = signalingRooms.get(auctionId);
                if (!room) break;
                const targetWs = room.viewers.get(to) || (room.sellerId === to ? room.sellerWs : null);
                if (targetWs) send(targetWs, { type: 'answer', from: socketId, sdp });
                break;
            }

            case 'ice-candidate': {
                const { auctionId, candidate, to } = payload;
                const room = signalingRooms.get(auctionId);
                if (!room) break;
                if (to) {
                    const targetWs = room.viewers.get(to) || (room.sellerId === to ? room.sellerWs : null);
                    if (targetWs) send(targetWs, { type: 'ice-candidate', from: socketId, candidate });
                } else {
                    // Broadcast to all others in room
                    room.viewers.forEach((vws, vid) => {
                        if (vid !== socketId) send(vws, { type: 'ice-candidate', from: socketId, candidate });
                    });
                    if (room.sellerWs && room.sellerId !== socketId) {
                        send(room.sellerWs, { type: 'ice-candidate', from: socketId, candidate });
                    }
                }
                break;
            }

            default:
                console.warn('Unknown message type:', type);
        }
    });

    ws.on('close', () => {
        // Clean up bidding state
        if (clients.has(ws)) {
            const { auctionId, username } = clients.get(ws);
            clients.delete(ws);
            if (biddingRooms.has(auctionId)) {
                biddingRooms.get(auctionId).delete(ws);
                if (biddingRooms.get(auctionId).size === 0) biddingRooms.delete(auctionId);
            }
            console.log(`${username} disconnected from bidding`);
        }

        // Clean up signaling state
        if (signalingClients.has(ws)) {
            const { socketId: sid, auctionId, role } = signalingClients.get(ws);
            signalingClients.delete(ws);
            const room = signalingRooms.get(auctionId);
            if (room) {
                if (role === 'seller') {
                    room.sellerWs = null;
                    room.sellerId = null;
                } else {
                    room.viewers.delete(sid);
                }
                broadcastViewerCount(auctionId);
            }
            console.log(`${sid} (${role}) disconnected from signaling`);
        }
    });
});

console.log(`Bidding + Signaling WebSocket Service started on port ${port}`);
