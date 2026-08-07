import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(currentDirectory, '../uploads'), {
  setHeaders(response) {
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
}));

app.use('/api', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
