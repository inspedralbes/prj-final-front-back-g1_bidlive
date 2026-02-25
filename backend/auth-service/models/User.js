const db = require("../config/db");
const bcrypt = require("bcrypt");

const User = {
  createTable: async () => {
    const createSql = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                avatar_url VARCHAR(500) DEFAULT NULL,
                bio TEXT DEFAULT NULL,
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
  },

  create: async (username, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
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
    const sql = "SELECT id, username, email, avatar_url, bio, reputation_score, total_sales, created_at FROM users WHERE id = ?";
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

  updateProfile: async (id, { username, bio }) => {
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

  incrementReputation: async (id) => {
    const sql = "UPDATE users SET reputation_score = reputation_score + 1, total_sales = total_sales + 1 WHERE id = ?";
    return db.query(sql, [id]);
  }
};

module.exports = User;
