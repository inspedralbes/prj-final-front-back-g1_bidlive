const db = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
  createTable: async () => {
    const sql = `
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
    return db.query(sql);
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
    const sql = "SELECT id, username, email, avatar_url, billing_address, payment_method FROM users WHERE id = ?";
    const result = await db.query(sql, [id]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows && rows.length > 0 ? rows[0] : null;
  },

  validatePassword: async (password, hash) => {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
  },

  updateProfile: async (id, { username, avatar_url, billing_address, payment_method }) => {
    const sql = "UPDATE users SET username = ?, avatar_url = ?, billing_address = ?, payment_method = ? WHERE id = ?";
    return db.query(sql, [username, avatar_url, billing_address, payment_method, id]);
  },
};

module.exports = User;
