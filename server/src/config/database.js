import mysql from 'mysql2/promise';
import env from './env.js';

const database = mysql.createPool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function checkDatabaseConnection() {
  const connection = await database.getConnection();
  connection.release();
}

export default database;
