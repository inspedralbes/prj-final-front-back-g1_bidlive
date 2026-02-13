const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        return db.query(sql);
    },

    create: async (username, email, password) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        return db.query(sql, [username, email, hashedPassword]);
    },

    findByEmail: async (email) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const result = await db.query(sql, [email]);
        return result[0];
    },

    findById: async (id) => {
        const sql = 'SELECT id, username, email FROM users WHERE id = ?';
        const result = await db.query(sql, [id]);
        return result[0];
    },

    validatePassword: async (password, hash) => {
        return bcrypt.compare(password, hash);
    }
};

module.exports = User;
