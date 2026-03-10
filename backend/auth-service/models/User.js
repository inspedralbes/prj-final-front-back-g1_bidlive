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
                bio TEXT,
                billing_address VARCHAR(255),
                payment_method VARCHAR(255),
                reputation_score INT DEFAULT 0,
                total_sales INT DEFAULT 0,
                wallet_balance DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
    await db.query(createSql);
    // Migrate existing tables
    const columns = [
      { name: "avatar_url", type: "VARCHAR(500) DEFAULT NULL" },
      { name: "bio", type: "TEXT DEFAULT NULL" },
      { name: "reputation_score", type: "INT DEFAULT 0" },
      { name: "total_sales", type: "INT DEFAULT 0" },
      { name: "wallet_balance", type: "DECIMAL(10,2) DEFAULT 0.00" },
      { name: "billing_address", type: "VARCHAR(255) DEFAULT NULL" },
      { name: "payment_method", type: "VARCHAR(255) DEFAULT NULL" }
    ];

    for (const col of columns) {
      try {
        await db.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
      } catch (_) { /* column already exists */ }
    }
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
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows && rows.length > 0 ? rows[0] : null;
  },

  findById: async (id) => {
    const sql = "SELECT id, username, email, avatar_url, bio, billing_address, payment_method, wallet_balance, reputation_score, total_sales FROM users WHERE id = ?";
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

  updateProfile: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.username !== undefined) { fields.push("username = ?"); values.push(data.username); }
    if (data.avatar_url !== undefined) { fields.push("avatar_url = ?"); values.push(data.avatar_url); }
    if (data.bio !== undefined) { fields.push("bio = ?"); values.push(data.bio); }
    if (data.billing_address !== undefined) { fields.push("billing_address = ?"); values.push(data.billing_address); }
    if (data.payment_method !== undefined) { fields.push("payment_method = ?"); values.push(data.payment_method); }

    if (fields.length === 0) return;

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    return db.query(sql, values);
  },

  updateAvatar: async (id, avatarUrl) => {
    const sql = "UPDATE users SET avatar_url = ? WHERE id = ?";
    return db.query(sql, [avatarUrl, id]);
  },

  validatePassword: async (password, hash) => {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
  },

  addMoney: async (userId, amount) => {
    const sql = "UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?";
    return db.query(sql, [amount, userId]);
  },
};

module.exports = User;
