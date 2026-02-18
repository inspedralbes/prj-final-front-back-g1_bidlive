const WebSocket = require('ws');
const port = process.env.PORT || 3002;

const wss = new WebSocket.Server({ port });

// Store clients and their rooms
const clients = new Map(); // ws -> { auctionId, username }
const rooms = new Map(); // auctionId -> Set(ws)

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const { type, payload } = data;

            switch (type) {
                case 'JOIN_ROOM':
                    const { auctionId, username } = payload;

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
                    clients.set(ws, { auctionId, username });
                    if (!rooms.has(auctionId)) {
                        rooms.set(auctionId, new Set());
                    }
                    rooms.get(auctionId).add(ws);

                    console.log(`${username} joined room ${auctionId}`);

                    // Welcome message
                    ws.send(JSON.stringify({
                        type: 'SYSTEM',
                        payload: { message: `Welcome to the auction room, ${username}!` },
                        timestamp: new Date().toISOString()
                    }));
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
                    // TODO: Implement bidding logic validations here or communicate with auction-service
                    // For now, just broadcast the bid to the room
                    if (clients.has(ws)) {
                        const { auctionId, username: bidderName } = clients.get(ws);
                        const bidMessage = {
                            type: 'BID_PLACED',
                            payload: {
                                username: bidderName,
                                amount: payload.amount
                            },
                            timestamp: new Date().toISOString()
                        };

                        // Broadcast bid to room
                        if (rooms.has(auctionId)) {
                            rooms.get(auctionId).forEach(client => {
                                if (client.readyState === WebSocket.OPEN) {
                                    client.send(JSON.stringify(bidMessage));
                                }
                            });
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

    // ws.send('BS Connection Info: Connected to Bidding Service'); // Removed strict connection message to use protocol
});

console.log(`Bidding Service started on port ${port}`);
