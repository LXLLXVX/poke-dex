const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'poke_team',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
  namedPlaceholders: true,
};

const pool = mysql.createPool(config);

module.exports = pool;
