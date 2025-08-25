const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT || 5432)
});

pool.on('error', (err) => {
  console.error('Error inesperado en Postgres:', err);
  process.exit(1);
});

module.exports = pool;
