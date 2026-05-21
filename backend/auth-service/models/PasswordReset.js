const crypto = require('crypto');
const db = require('../config/db');

// Table schema:
// CREATE TABLE IF NOT EXISTS password_reset_tokens (
//   token VARCHAR(64) PRIMARY KEY,
//   user_id INT NOT NULL,
//   expires_at DATETIME NOT NULL,
//   used TINYINT DEFAULT 0
// )

const PasswordReset = {
    createTable: async () => {
        await db.query(`
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                token VARCHAR(64) PRIMARY KEY,
                user_id INT NOT NULL,
                expires_at DATETIME NOT NULL,
                used TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    },

    /** Create a new 1-hour reset token for a user */
    create: async (userId) => {
        // Invalidate old tokens for this user
        await db.query('UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?', [userId]);
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await db.query(
            'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES (?, ?, ?)',
            [token, userId, expiresAt]
        );
        return token;
    },

    /** Find a valid (unused, non-expired) token */
    findValid: async (token) => {
        const result = await db.query(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()',
            [token]
        );
        const rows = Array.isArray(result[0]) ? result[0] : result;
        return rows && rows.length > 0 ? rows[0] : null;
    },

    /** Mark token as used */
    markUsed: async (token) => {
        await db.query('UPDATE password_reset_tokens SET used = 1 WHERE token = ?', [token]);
    },
};

module.exports = PasswordReset;
