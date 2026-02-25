const db = require('../config/db');

const Puja = {
    createTable: async () => {
        // Ejecutamos CREATE TABLE primero
        await db.query(`
            CREATE TABLE IF NOT EXISTS pujas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100) DEFAULT 'Collectibles',
                reserve_price DECIMAL(10, 2),
                duration VARCHAR(50) DEFAULT '1 Hour',
                mode ENUM('video', 'photo') DEFAULT 'video',
                starting_price DECIMAL(10, 2) NOT NULL,
                current_price DECIMAL(10, 2) DEFAULT 0.00,
                image_url VARCHAR(2048),
                seller_id INT NOT NULL,
                status ENUM('live', 'upcoming', 'ended') DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Si la tabla existía pero le faltaban columnas, tratamos de añadirlas.
        // Capturamos el error si ya existen (por eso el try/catch por cada alter)
        try { await db.query("ALTER TABLE pujas ADD COLUMN category VARCHAR(100) DEFAULT 'Collectibles'"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN reserve_price DECIMAL(10, 2)"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN duration VARCHAR(50) DEFAULT '1 Hour'"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN mode ENUM('video', 'photo') DEFAULT 'video'"); } catch (e) { }

        return true;
    },

    create: async (title, description, category, reservePrice, duration, mode, startingPrice, imageUrl, sellerId, status = 'upcoming') => {
        const sql = `
            INSERT INTO pujas (title, description, category, reserve_price, duration, mode, starting_price, current_price, image_url, seller_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await db.query(sql, [title, description, category, reservePrice, duration, mode, startingPrice, startingPrice, imageUrl, sellerId, status]);
        return { id: result.insertId, title, description, category, reservePrice, duration, mode, startingPrice, currentPrice: startingPrice, imageUrl, sellerId, status };
    },

    findAll: async (status = null, search = null) => {
        let query = `
            SELECT p.*, u.username as seller_username, u.reputation_score, u.total_sales 
            FROM pujas p 
            LEFT JOIN users u ON p.seller_id = u.id
        `;
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
        const sql = `
            SELECT p.*, u.username as seller_username, u.reputation_score, u.total_sales 
            FROM pujas p 
            LEFT JOIN users u ON p.seller_id = u.id 
            WHERE p.seller_id = ? 
            ORDER BY p.created_at DESC
        `;
        return await db.query(sql, [sellerId]);
    },

    updateStatus: async (id, status) => {
        const sql = 'UPDATE pujas SET status = ? WHERE id = ?';
        return db.query(sql, [status, id]);
    }
};

module.exports = Puja;
