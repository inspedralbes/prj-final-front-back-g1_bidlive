const db = require("../config/db");

const Follower = {
  createTable: async () => {
    const createSql = `
            CREATE TABLE IF NOT EXISTS followers (
                follower_id INT NOT NULL,
                seller_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (follower_id, seller_id),
                FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
    await db.query(createSql);
  },

  follow: async (followerId, sellerId) => {
    if (followerId === sellerId) throw new Error("You cannot follow yourself");
    const sql = "INSERT IGNORE INTO followers (follower_id, seller_id) VALUES (?, ?)";
    return db.query(sql, [followerId, sellerId]);
  },

  unfollow: async (followerId, sellerId) => {
    const sql = "DELETE FROM followers WHERE follower_id = ? AND seller_id = ?";
    return db.query(sql, [followerId, sellerId]);
  },

  isFollowing: async (followerId, sellerId) => {
    const sql = "SELECT 1 FROM followers WHERE follower_id = ? AND seller_id = ?";
    const result = await db.query(sql, [followerId, sellerId]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows && rows.length > 0;
  },

  getFollowersCount: async (sellerId) => {
    const sql = "SELECT COUNT(*) as count FROM followers WHERE seller_id = ?";
    const result = await db.query(sql, [sellerId]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows[0].count;
  },

  getFollowingCount: async (followerId) => {
    const sql = "SELECT COUNT(*) as count FROM followers WHERE follower_id = ?";
    const result = await db.query(sql, [followerId]);
    const rows = Array.isArray(result[0]) ? result[0] : result;
    return rows[0].count;
  },

  getFollowers: async (sellerId) => {
    const sql = "SELECT u.id, u.username, u.avatar_url FROM followers f JOIN users u ON f.follower_id = u.id WHERE f.seller_id = ?";
    const result = await db.query(sql, [sellerId]);
    return Array.isArray(result[0]) ? result[0] : result;
  }
};

module.exports = Follower;
