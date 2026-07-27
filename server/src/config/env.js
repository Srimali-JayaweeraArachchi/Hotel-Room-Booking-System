import dotenv from 'dotenv';

dotenv.config();

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
};

export default env;
