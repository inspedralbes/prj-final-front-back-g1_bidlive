const db = require('../config/db');

const Puja = {
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS pujas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                starting_price DECIMAL(10, 2) NOT NULL,
                current_price DECIMAL(10, 2) DEFAULT 0.00,
                image_url VARCHAR(2048),
                seller_id INT NOT NULL,
                status ENUM('live', 'upcoming', 'ended') DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        return db.query(sql);
    },

    create: async (title, description, startingPrice, imageUrl, sellerId, status = 'upcoming') => {
        const sql = `
            INSERT INTO pujas (title, description, starting_price, current_price, image_url, seller_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await db.query(sql, [title, description, startingPrice, startingPrice, imageUrl, sellerId, status]);
        return { id: result.insertId, title, description, startingPrice, currentPrice: startingPrice, imageUrl, sellerId, status };
    },

    findAll: async (status = null, search = null) => {
        let query = 'SELECT * FROM pujas';
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (search) {
            conditions.push('(title LIKE ? OR description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        try {
            const rows = await db.query(query, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    },

    findById: async (id) => {
        const sql = 'SELECT * FROM pujas WHERE id = ?';
        const rows = await db.query(sql, [id]);
        return rows[0];
    },

    findBySellerId: async (sellerId) => {
        const sql = 'SELECT * FROM pujas WHERE seller_id = ? ORDER BY created_at DESC';
        return await db.query(sql, [sellerId]);
    }
};

module.exports = Puja;
