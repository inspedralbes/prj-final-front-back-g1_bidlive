const db = require('../config/db');

const SEED_CATEGORIES = [
    { name: 'Tecnologia', icon: 'devices' },
    { name: 'Hogar', icon: 'house' },
    { name: 'Moda', icon: 'checkroom' },
    { name: 'Arte', icon: 'palette' },
    { name: 'Coleccionismo', icon: 'star' },
    { name: 'Deportes', icon: 'sports_soccer' },
    { name: 'Joyería', icon: 'diamond' },
    { name: 'Vehículos', icon: 'directions_car' },
    { name: 'Gaming', icon: 'sports_esports' },
    { name: 'Otros', icon: 'grid_view' },
];

const Category = {
    createTable: async () => {
        const sql = `
            CREATE TABLE IF NOT EXISTS categories (
                id   INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                icon VARCHAR(100) NOT NULL DEFAULT 'grid_view'
            )
        `;
        return db.query(sql);
    },

    seed: async () => {
        for (const cat of SEED_CATEGORIES) {
            await db.query(
                'INSERT IGNORE INTO categories (name, icon) VALUES (?, ?)',
                [cat.name, cat.icon]
            );
        }
    },

    findAll: async () => {
        return db.query('SELECT * FROM categories ORDER BY id ASC');
    },

    findById: async (id) => {
        const rows = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    },

    findByName: async (name) => {
        const rows = await db.query('SELECT * FROM categories WHERE name = ?', [name]);
        return rows[0];
    },
};

module.exports = Category;
