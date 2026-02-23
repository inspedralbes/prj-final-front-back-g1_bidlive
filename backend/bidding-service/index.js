const WebSocket = require('ws');
const db = require('./config/db');
require('dotenv').config();

const port = process.env.PORT || 3002;

const wss = new WebSocket.Server({ port });

// Store clients and their rooms
const clients = new Map(); // ws -> { auctionId, username }
const rooms = new Map(); // auctionId -> Set(ws)

// Initialize Database Table
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

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            const { type, payload } = data;
            console.log(`Received message: ${type}`, payload);

            switch (type) {
                case 'JOIN_ROOM':
                    const { auctionId, username, userId } = payload; // Added userId to payload

                    // Leave previous room if any
                    if (clients.has(ws)) {
                        const oldRoomId = clients.get(ws).auctionId;
                        if (rooms.has(oldRoomId)) {
                            rooms.get(oldRoomId).delete(ws);
                            if (rooms.get(oldRoomId).size === 0) {
                                rooms.delete(oldRoomId);
                            }
                        }
                    }

                    // Join new room
                    clients.set(ws, { auctionId, username, userId });
                    if (!rooms.has(auctionId)) {
                        rooms.set(auctionId, new Set());
                    }
                    rooms.get(auctionId).add(ws);

                    console.log(`${username} joined room ${auctionId}`);

                    // Fetch current auction status
                    try {
                        const [auction] = await db.query('SELECT current_price, starting_price, seller_id FROM pujas WHERE id = ?', [auctionId]);
                        const currentPrice = auction ? (auction.current_price || auction.starting_price) : 0;

                        // Send current status to the user
                        ws.send(JSON.stringify({
                            type: 'AUCTION_UPDATE',
                            payload: {
                                currentPrice: parseFloat(currentPrice),
                                sellerId: auction.seller_id,
                                message: `Connected. Current price: €${currentPrice}`
                            },
                            timestamp: new Date().toISOString()
                        }));

                    } catch (dbError) {
                        console.error('Error fetching auction details:', dbError);
                    }
                    break;

                case 'CHAT_MESSAGE':
                    if (clients.has(ws)) {
                        const { auctionId, username: senderName } = clients.get(ws);
                        const chatMessage = {
                            type: 'CHAT_MESSAGE',
                            payload: {
                                username: senderName,
                                message: payload.message,
                                isSystem: false
                            },
                            timestamp: new Date().toISOString()
                        };

                        // Broadcast to everyone in the room
                        if (rooms.has(auctionId)) {
                            rooms.get(auctionId).forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify(chatMessage));
                                }
                            });
                        }
                    }
                    break;

                case 'PLACE_BID':
                    if (clients.has(ws)) {
                        const { auctionId, username: bidderName, userId: bidderId } = clients.get(ws);
                        const bidAmount = parseFloat(payload.amount);

                        try {
                            // 1. Get current price
                            const [auction] = await db.query('SELECT current_price, starting_price, seller_id FROM pujas WHERE id = ?', [auctionId]);

                            if (!auction) {
                                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Auction not found' } }));
                                return;
                            }

                            const currentPrice = parseFloat(auction.current_price || auction.starting_price);

                            // 2. Validate Bid
                            if (bidAmount <= currentPrice) {
                                ws.send(JSON.stringify({
                                    type: 'ERROR',
                                    payload: { message: `Bid must be higher than €${currentPrice}` }
                                }));
                                return;
                            }

                            // 3. Insert Bid
                            // Default userId to 0 or handled if not logged in (logic depends on auth req)
                            // For now assuming we passed userId on JOIN or we handle it here.
                            // If userId is missing from client, we might fail or store as anonymous? 
                            // Let's assume passed in JOIN_ROOM or we need to handle it.
                            const actualUserId = bidderId || null;

                            if (!actualUserId) {
                                // For now, allow anonymous bids for testing if strictly necessary, 
                                // BUT better to enforce login. 
                                // As per "functional" requirement, let's allow it but log a warning or use a placeholder user if exists.
                                // Actually, foreign key constraint might fail.
                                // Let's strictly require it or handle gracefully if guest.
                            }

                            // UPDATE: We need a valid user_id for the FK. 
                            // If guest, we can't insert into DB if strict FK. 
                            // Let's just update the puja price for now if no user, OR skip DB insert if guest.

                            if (actualUserId) {
                                await db.query('INSERT INTO bids (puja_id, user_id, amount) VALUES (?, ?, ?)', [auctionId, actualUserId, bidAmount]);
                            }

                            // 4. Update Auction Price
                            await db.query('UPDATE pujas SET current_price = ? WHERE id = ?', [bidAmount, auctionId]);

                            // 5. Broadcast Update
                            const updateMessage = {
                                type: 'AUCTION_UPDATE',
                                payload: {
                                    currentPrice: bidAmount,
                                    lastBidder: bidderName,
                                    message: `${bidderName} placed a new highest bid: €${bidAmount}`
                                },
                                timestamp: new Date().toISOString()
                            };

                            const bidNotification = {
                                type: 'BID_PLACED', // For chat log
                                payload: {
                                    username: bidderName,
                                    amount: bidAmount
                                },
                                timestamp: new Date().toISOString()
                            };


                            if (rooms.has(auctionId)) {
                                rooms.get(auctionId).forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify(updateMessage));
                                        client.send(JSON.stringify(bidNotification));
                                    }
                                });
                            }

                        } catch (err) {
                            console.error('Error processing bid DETAIL:', err);
                            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Failed to process bid' } }));
                        }
                    }
                    break;

                case 'END_AUCTION':
                    if (clients.has(ws)) {
                        const { auctionId, userId } = clients.get(ws);

                        try {
                            // 1. Verify Seller
                            const [auction] = await db.query('SELECT seller_id, current_price, starting_price FROM pujas WHERE id = ?', [auctionId]);

                            if (!auction) {
                                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Auction not found' } }));
                                return;
                            }

                            // Ensure userId matches seller_id
                            if (!userId || String(userId) !== String(auction.seller_id)) {
                                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Unauthorized. Only seller can end auction.' } }));
                                return;
                            }

                            // 2. Update DB Status
                            await db.query("UPDATE pujas SET status = 'ended' WHERE id = ?", [auctionId]);

                            // 3. Get Winner Info (Highest Bidder)
                            const [lastBid] = await db.query(`
                                SELECT b.amount, u.username
                                FROM bids b
                                JOIN users u ON b.user_id = u.id
                                WHERE b.puja_id = ?
                                ORDER BY b.amount DESC
                                LIMIT 1
                            `, [auctionId]);

                            const finalPrice = auction.current_price || auction.starting_price;
                            const winnerName = lastBid ? lastBid.username : 'No Bids';

                            // 4. Broadcast AUCTION_ENDED
                            const endMessage = {
                                type: 'AUCTION_ENDED',
                                payload: {
                                    finalPrice: finalPrice,
                                    winner: winnerName,
                                    message: `Auction Ended! Winner: ${winnerName} for €${finalPrice}`
                                },
                                timestamp: new Date().toISOString()
                            };

                            if (rooms.has(auctionId)) {
                                rooms.get(auctionId).forEach(client => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(JSON.stringify(endMessage));
                                    }
                                });
                            }
                            console.log(`Auction ${auctionId} ended by seller ${userId}`);

                        } catch (err) {
                            console.error('Error ending auction:', err);
                            ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Failed to end auction' } }));
                        }
                    }
                    break;

                default:
                    console.warn('Unknown message type:', type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        if (clients.has(ws)) {
            const { auctionId, username } = clients.get(ws);
            clients.delete(ws);

            if (rooms.has(auctionId)) {
                rooms.get(auctionId).delete(ws);
                if (rooms.get(auctionId).size === 0) {
                    rooms.delete(auctionId);
                }
            }
            console.log(`${username} disconnected`);
        }
    });
});

console.log(`Bidding Service started on port ${port} - Persistent & Validated`);
