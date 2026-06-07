const db = require("../config/db");

const Notification = {
  createTable: async () => {
    const createSql = `
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'success', 'warning', 'error', 'outbid') DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                link VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
    await db.query(createSql);
  },

  create: async ({ user_id, title, message, type, link }) => {
    const sql = "INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)";
    return db.query(sql, [user_id, title, message, type || 'info', link || null]);
  },

  findByUserId: async (userId, limit = 50) => {
    const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?";
    const result = await db.query(sql, [userId, limit]);
    return Array.isArray(result[0]) ? result[0] : result;
  },

  markAsRead: async (notificationId, userId) => {
    const sql = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?";
    return db.query(sql, [notificationId, userId]);
  },

  markAllAsRead: async (userId) => {
    const sql = "UPDATE notifications SET is_read = TRUE WHERE user_id = ?";
    return db.query(sql, [userId]);
  },

  deleteOld: async (days = 30) => {
    const sql = "DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
    return db.query(sql, [days]);
  }
};

module.exports = Notification;
