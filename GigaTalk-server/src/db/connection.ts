import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const { SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB } = process.env;

if (!SQL_HOST || !SQL_USER || !SQL_PASSWORD || !SQL_DB) {
  throw new Error("Missing environment variables for database connection");
}

const poolSize = 20;

export const connection: Pool = mysql.createPool({
  connectionLimit: poolSize,
  host: SQL_HOST,
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DB,
});

setInterval(async () => {
  try {
    await connection.query('SELECT 1');
  } catch (error) {
    console.error('Error keeping the MySQL connection alive:', error);
  }
}, 200000);

export default connection;
