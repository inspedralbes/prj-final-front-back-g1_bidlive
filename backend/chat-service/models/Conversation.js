const db = require('../config/db');

class Conversation {
    static async createTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS conversations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user1_id INT NOT NULL,
                user2_id INT NOT NULL,
                last_message TEXT,
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_participants (user1_id, user2_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        return db.query(query);
    }

    static async findOrCreate(u1, u2) {
        // Ensure user1_id is always the smaller one to maintain uniqueness
        const [user1_id, user2_id] = u1 < u2 ? [u1, u2] : [u2, u1];
        
        const existing = await db.query(
            'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?',
            [user1_id, user2_id]
        );

        if (existing.length > 0) return existing[0];

        const result = await db.query(
            'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)',
            [user1_id, user2_id]
        );
        return { id: result.insertId, user1_id, user2_id };
    }

    static async findByUser(userId) {
        const query = `
            SELECT 
                c.*,
                u.username AS other_username,
                u.avatar_url AS other_avatar_url,
                u.id AS other_id,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = FALSE) AS unread_count
            FROM conversations c
            JOIN users u ON (
                (c.user1_id = ? AND u.id = c.user2_id) OR
                (c.user2_id = ? AND u.id = c.user1_id)
            )
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.last_message_at DESC
        `;
        return db.query(query, [userId, userId, userId, userId, userId]);
    }
}

module.exports = Conversation;
