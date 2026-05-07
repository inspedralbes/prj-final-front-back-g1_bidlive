const db = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
  createTable: async () => {
    const createSql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                avatar_url TEXT,
                billing_address VARCHAR(255),
                payment_method VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
    await db.query(createSql);
    // Migrate existing tables that may not have avatar_url or bio
    try {
      await db.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL");
    } catch (_) { /* column already exists */ }
    try {
      await db.query("ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL");
    } catch (_) { /* column already exists */ }
    try {
      await db.query("ALTER TABLE users ADD COLUMN reputation_score INT DEFAULT 0");
    } catch (_) { /* column already exists */ }
    try {
      await db.query("ALTER TABLE users ADD COLUMN total_sales INT DEFAULT 0");
    } catch (_) { /* column already exists */ }
    try {
      await db.query("ALTER TABLE users ADD COLUMN total_bids INT DEFAULT 0");
    } catch (_) { /* column already exists */ }
    try {
      await db.query("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00");
    } catch (_) { /* column already exists */ }

    // Create payments table for idempotency
    const paymentsSql = `
        CREATE TABLE IF NOT EXISTS payments (
            id VARCHAR(255) PRIMARY KEY,
            user_id INT NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await db.query(paymentsSql);
  },

  create: async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO users (username, email, password, wallet_balance) VALUES (?, ?, ?, 0.00)";
    return db.query(sql, [username, email, hashedPassword]);
  },

  findByEmail: async (email) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    const result = await db.query(sql, [email]);

    // Manejo robusto de resultados para evitar el error de "Invalid Credentials"
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows && rows.length > 0 ? rows[0] : null;
  },

  findById: async (id) => {
    const sql = "SELECT id, username, email, avatar_url, billing_address, payment_method, wallet_balance, reputation_score as reputation, total_sales, total_bids, bio FROM users WHERE id = ?";
    const result = await db.query(sql, [id]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows && rows.length > 0 ? rows[0] : null;
  },

  findByUsername: async (username) => {
    const sql = "SELECT id FROM users WHERE username = ?";
    const result = await db.query(sql, [username]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows && rows.length > 0 ? rows[0] : null;
  },

  updateBasicProfile: async (id, { username, bio }) => {
    const sql = "UPDATE users SET username = ?, bio = ? WHERE id = ?";
    return db.query(sql, [username, bio, id]);
  },

  updateAvatar: async (id, avatarUrl) => {
    const sql = "UPDATE users SET avatar_url = ? WHERE id = ?";
    return db.query(sql, [avatarUrl, id]);
  },

  validatePassword: async (password, hash) => {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
  },

  updateFullProfile: async (id, { username, bio, avatar_url, billing_address, payment_method }) => {
    const sql = "UPDATE users SET username = ?, bio = ?, avatar_url = ?, billing_address = ?, payment_method = ? WHERE id = ?";
    return db.query(sql, [username, bio, avatar_url, billing_address, payment_method, id]);
  },

  addMoney: async (userId, amount) => {
    const sql = "UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?";
    return db.query(sql, [amount, userId]);
  },

  subtractMoney: async (userId, amount) => {
    const sql = "UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ? AND wallet_balance >= ?";
    const result = await db.query(sql, [amount, userId, amount]);
    // result[0].affectedRows might be nested depending on mysql2 version/wrapper
    const affectedRows = result[0]?.affectedRows ?? result.affectedRows;
    return affectedRows > 0;
  },

  isPaymentProcessed: async (sessionId) => {
    const sql = "SELECT id FROM payments WHERE id = ?";
    const result = await db.query(sql, [sessionId]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows && rows.length > 0;
  },

  markPaymentProcessed: async (sessionId, userId, amount) => {
    const sql = "INSERT INTO payments (id, user_id, amount) VALUES (?, ?, ?)";
    return db.query(sql, [sessionId, userId, amount]);
  },

  search: async (query, limit = 20, offset = 0) => {
    const q = `%${query}%`;
    const sql = `
      SELECT u.id, u.username, u.avatar_url, u.bio, u.reputation_score as reputation, u.total_sales,
      (SELECT COUNT(*) FROM followers WHERE seller_id = u.id) as followers_count
      FROM users u
      WHERE u.username LIKE ? OR u.bio LIKE ?
      ORDER BY u.reputation_score DESC, u.total_sales DESC
      LIMIT ? OFFSET ?
    `;
    const result = await db.query(sql, [q, q, parseInt(limit), parseInt(offset)]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows;
  },

  getTopSellers: async (limit = 20) => {
    const sql = `
      SELECT u.id, u.username, u.avatar_url, u.bio, u.reputation_score as reputation, u.total_sales,
      (SELECT COUNT(*) FROM followers WHERE seller_id = u.id) as followers_count
      FROM users u
      ORDER BY u.reputation_score DESC, u.total_sales DESC
      LIMIT ?
    `;
    const result = await db.query(sql, [parseInt(limit)]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows;
  },
};

module.exports = User;
