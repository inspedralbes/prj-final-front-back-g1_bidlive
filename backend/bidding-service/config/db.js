const mysql = require('mysql2');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'rootpassword',
    database: process.env.DB_NAME || 'bidlive'
});

// Ping database to check connection
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('[BiddingDB] Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('[BiddingDB] Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('[BiddingDB] Database connection was refused.');
        }
    }
    if (connection) connection.release();
    return;
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);
pool.getConnection = util.promisify(pool.getConnection);

module.exports = pool;
