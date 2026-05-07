const db = require('../config/db');

class Message {
    static async createTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                conversation_id INT NOT NULL,
                sender_id INT NOT NULL,
                content TEXT NOT NULL,
                is_system_message BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_read BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await db.query(query);
        // Migration for existing tables
        try {
            await db.query('ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE');
        } catch (_) {}
    }

    static async create(conversationId, senderId, content, isSystem = false) {
        const result = await db.query(
            'INSERT INTO messages (conversation_id, sender_id, content, is_system_message) VALUES (?, ?, ?, ?)',
            [conversationId, senderId, content, isSystem]
        );
        
        // Update conversation last message
        await db.query(
            'UPDATE conversations SET last_message = ?, last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
            [content, conversationId]
        );

        return { 
            id: result.insertId, 
            conversation_id: conversationId, 
            sender_id: senderId, 
            content, 
            is_system_message: isSystem,
            is_read: false,
            created_at: new Date()
        };
    }

    static async findByConversation(conversationId) {
        return db.query(
            'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
            [conversationId]
        );
    }

    static async markAsRead(conversationId, userId) {
        return db.query(
            'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE',
            [conversationId, userId]
        );
    }
}

module.exports = Message;
