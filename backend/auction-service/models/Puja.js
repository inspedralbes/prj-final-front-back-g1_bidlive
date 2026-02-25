const db = require('../config/db');

const sql = `
    CREATE TABLE IF NOT EXISTS pujas (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        title          VARCHAR(255) NOT NULL,
        description    TEXT,
        starting_price DECIMAL(10,2) NOT NULL,
        current_price  DECIMAL(10,2) DEFAULT 0.00,
        image_url      VARCHAR(2048),
        seller_id      INT NOT NULL,
        status         ENUM('live','upcoming','ended') DEFAULT 'upcoming',
        category_id    INT DEFAULT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
`;

const Puja = {
    createTable: async () => db.query(sql),

    create: async (title, description, startingPrice, imageUrl, sellerId, status = 'upcoming', categoryId = null) => {
        const insertSql = `
            INSERT INTO pujas (title, description, starting_price, current_price, image_url, seller_id, status, category_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await db.query(insertSql, [title, description, startingPrice, startingPrice, imageUrl, sellerId, status, categoryId]);
        return { id: result.insertId, title, description, startingPrice, currentPrice: startingPrice, imageUrl, sellerId, status, categoryId };
    },

    findAll: async (status = null, search = null, categoryId = null) => {
        // Join with categories so we always have the name & icon in one query
        let query = `
            SELECT p.*, c.name AS category_name, c.icon AS category_icon
            FROM pujas p
            LEFT JOIN categories c ON p.category_id = c.id
        `;
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }

        if (search) {
            conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (categoryId) {
            conditions.push('p.category_id = ?');
            params.push(categoryId);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.created_at DESC';

        try {
            return await db.query(query, params);
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    },

    findById: async (id) => {
        const rows = await db.query(
            `SELECT p.*, c.name AS category_name, c.icon AS category_icon
             FROM pujas p LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    },

    findBySellerId: async (sellerId) => {
        return db.query(
            `SELECT p.*, c.name AS category_name, c.icon AS category_icon
             FROM pujas p LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.seller_id = ?
             ORDER BY p.created_at DESC`,
            [sellerId]
        );
    },

    // Idempotent migration: add category_id column to existing tables
    migrate: async () => {
        try {
            await db.query('ALTER TABLE pujas ADD COLUMN category_id INT DEFAULT NULL');
            await db.query('ALTER TABLE pujas ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL');
            console.log('Migration: category_id column added to pujas');
        } catch (err) {
            if (err.errno !== 1060 && err.errno !== 1826) { // 1060: dup column, 1826: dup FK
                console.warn('Migration warning (pujas.category_id):', err.message);
            }
        }
    },
};

module.exports = Puja;
