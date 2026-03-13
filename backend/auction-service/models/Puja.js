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

const favoritesSql = `
    CREATE TABLE IF NOT EXISTS favorites (
        user_id    INT NOT NULL,
        puja_id    INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, puja_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (puja_id) REFERENCES pujas(id) ON DELETE CASCADE
    )
`;

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
                winner_id INT DEFAULT NULL,
                payment_status ENUM('none', 'pending', 'paid') DEFAULT 'none',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Si la tabla existía pero le faltaban columnas, tratamos de añadirlas.
        // Capturamos el error si ya existen (por eso el try/catch por cada alter)
        try { await db.query("ALTER TABLE pujas ADD COLUMN category VARCHAR(100) DEFAULT 'Collectibles'"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN reserve_price DECIMAL(10, 2)"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN duration VARCHAR(50) DEFAULT '1 Hour'"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN mode ENUM('video', 'photo') DEFAULT 'video'"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN winner_id INT DEFAULT NULL"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD COLUMN payment_status ENUM('none', 'pending', 'paid') DEFAULT 'none'"); } catch (e) { }

        // Create favorites table
        await db.query(favoritesSql);

        return true;
    },

    migrate: async () => {
        try { await db.query("ALTER TABLE pujas ADD COLUMN category_id INT DEFAULT NULL"); } catch (e) { }
        try { await db.query("ALTER TABLE pujas ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL"); } catch (e) { }
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

    findAll: async (status = null, search = null, categoryId = null) => {
        let query = `
            SELECT p.*, u.username as seller_username, u.reputation_score, u.total_sales 
            FROM pujas p 
            LEFT JOIN users u ON p.seller_id = u.id
        `;
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        } else {
            // By default, do not show ended auctions in the general feed/explorer
            conditions.push("p.status != 'ended'");
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
    },

    // --- Favorites Logic ---
    addFavorite: async (userId, pujaId) => {
        const sql = 'INSERT IGNORE INTO favorites (user_id, puja_id) VALUES (?, ?)';
        return db.query(sql, [userId, pujaId]);
    },

    removeFavorite: async (userId, pujaId) => {
        const sql = 'DELETE FROM favorites WHERE user_id = ? AND puja_id = ?';
        return db.query(sql, [userId, pujaId]);
    },

    isFavorite: async (userId, pujaId) => {
        const sql = 'SELECT 1 FROM favorites WHERE user_id = ? AND puja_id = ?';
        const rows = await db.query(sql, [userId, pujaId]);
        return rows.length > 0;
    },

    findFavoritesByUser: async (userId) => {
        const sql = `
            SELECT p.*, u.username as seller_username 
            FROM favorites f
            JOIN pujas p ON f.puja_id = p.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `;
        return db.query(sql, [userId]);
    },

    // --- Winner & Payment Logic ---
    endWithWinner: async (id, winnerId, finalPrice) => {
        // If there's a winner, status is 'pending', else 'none'
        const paymentStatus = winnerId ? 'pending' : 'none';
        const sql = `
            UPDATE pujas 
            SET status = 'ended', winner_id = ?, current_price = ?, payment_status = ? 
            WHERE id = ?
        `;
        return db.query(sql, [winnerId, finalPrice, paymentStatus, id]);
    },

    findPaymentsByWinner: async (userId) => {
        const sql = `
            SELECT p.*, u.username as seller_username 
            FROM pujas p
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.winner_id = ? AND p.status = 'ended'
            ORDER BY p.created_at DESC
        `;
        return db.query(sql, [userId]);
    },

    updatePaymentStatus: async (id, status) => {
        const sql = 'UPDATE pujas SET payment_status = ? WHERE id = ?';
        return db.query(sql, [status, id]);
    }
};

module.exports = Puja;
