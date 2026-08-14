import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import env from '../config/env.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(
  currentDirectory,
  '../../../database/init',
);

const connection = await mysql.createConnection({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
  multipleStatements: true,
});

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = (await fs.readdir(migrationsDirectory))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();

  for (const filename of files) {
    const [appliedRows] = await connection.execute(
      'SELECT filename FROM schema_migrations WHERE filename = ? LIMIT 1',
      [filename],
    );

    if (appliedRows.length > 0) {
      console.log(`Skipped ${filename}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDirectory, filename), 'utf8');
    await connection.beginTransaction();
    try {
      await connection.query(sql);
      await connection.execute(
        'INSERT INTO schema_migrations (filename) VALUES (?)',
        [filename],
      );
      await connection.commit();
      console.log(`Applied ${filename}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }
} finally {
  await connection.end();
}
