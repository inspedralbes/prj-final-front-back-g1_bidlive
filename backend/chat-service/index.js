require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const authMiddleware = require('./middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    path: '/chat/socket.io',
    // CORS is handled by the Nginx Gateway
});

const port = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// app.use(cors());
app.use(express.json());

// ── Database Initialization ──────────────────────────────────────────────────
const initDB = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            await Conversation.createTable();
            await Message.createTable();
            console.log('✅ Chat database initialized');
            break;
        } catch (error) {
            console.error(`❌ DB Init error (${retries} left):`, error.message);
            retries--;
            if (retries === 0) process.exit(1);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

initDB();

// ── HTTP Routes ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('Chat Service is running'));

// Get user's conversations
app.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const conversations = await Conversation.findByUser(req.userId);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

// Find or create a conversation with another user
app.post('/conversations', authMiddleware, async (req, res) => {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: 'participantId is required' });
    
    // Block self-messaging
    if (parseInt(participantId) === parseInt(req.userId)) {
        return res.status(400).json({ message: 'Cannot message yourself' });
    }
    
    try {
        const conversation = await Conversation.findOrCreate(req.userId, participantId);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating conversation' });
    }
});

// Mark conversation as read
app.put('/conversations/:id/read', authMiddleware, async (req, res) => {
    try {
        await Message.markAsRead(req.params.id, req.userId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});

// Get messages for a conversation
app.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.findByConversation(req.params.id);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Helper for global notifications via auth-service
const notifyUserGlobal = async (userId, title, message, link) => {
    try {
        const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
        const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'bidlive_secret';
        
        await fetch(`${AUTH_URL}/notifications/internal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                internal_secret: INTERNAL_SECRET,
                user_id: userId,
                title,
                message,
                type: 'MESSAGE',
                link
            })
        });
    } catch (err) {
        console.error('Error sending global notification:', err.message);
    }
};

// Internal endpoint to create system messages (e.g., from auction-service)
app.post('/internal/system-message', async (req, res) => {
    const { secret, winnerId, sellerId, content } = req.body;
    if (secret !== (process.env.INTERNAL_SECRET || 'bidlive_secret')) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    try {
        const conversation = await Conversation.findOrCreate(winnerId, sellerId);
        const message = await Message.create(conversation.id, 0, content, true); // sender_id 0 for system
        
        // Notify participants via socket if online
        io.to(`user_${winnerId}`).to(`user_${sellerId}`).emit('new_message', message);
        
        // Global notification for winner
        await notifyUserGlobal(winnerId, '¡Has ganado la subasta! 🏆', content.split('\n')[0] || content, `/messages/${conversation.id}`);

        res.json({ success: true, message, conversationId: conversation.id });
    } catch (error) {
        console.error('System message error:', error);
        res.status(500).json({ message: 'Internal error' });
    }
});

// ── Socket.io Logic ─────────────────────────────────────────────────────────
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    const userId = socket.user.userId;
    const username = socket.user.username;
    console.log(`User connected to chat: ${userId}`);
    
    // Join a private room for this user
    socket.join(`user_${userId}`);

    socket.on('join_conversation', async (conversationId) => {
        socket.join(`conv_${conversationId}`);
        // Automatically mark as read when joining
        await Message.markAsRead(conversationId, userId);
        console.log(`User ${userId} joined and read conversation ${conversationId}`);
    });

    socket.on('send_message', async (data) => {
        const { conversationId, recipientId, content } = data;
        try {
            const message = await Message.create(conversationId, userId, content);
            
            // Broadcast to the conversation room
            io.to(`conv_${conversationId}`).emit('new_message', message);
            
            // Specifically notify the recipient to show a global notification or update badge
            io.to(`user_${recipientId}`).emit('notification_message', {
                conversationId,
                senderId: userId,
                senderName: username,
                content: content.substring(0, 50)
            });

            // Persist as global notification in auth-service
            await notifyUserGlobal(
                recipientId, 
                `New message from ${username}`, 
                content.substring(0, 50) + (content.length > 50 ? '...' : ''),
                `/messages/${conversationId}`
            );

        } catch (error) {
            console.error('Socket send_message error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected from chat: ${userId}`);
    });
});

server.listen(port, () => {
    console.log(`Chat Service listening on port ${port}`);
});
