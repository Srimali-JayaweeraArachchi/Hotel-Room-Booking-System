import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? 'hotel_booking',
    user: process.env.DB_USER ?? 'hotel_app',
    password: process.env.DB_PASSWORD ?? 'hotel_app_password',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'development_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
};

export default env;
