const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
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
    }
};

module.exports = User;
