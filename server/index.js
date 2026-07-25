import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');

const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.error('[Env] Failed to load .env file:', dotenvResult.error.message);
  console.error('[Env] Expected location:', envPath);
}

const apiKey = process.env.GEMINI_API_KEY?.trim();

console.log('[Env] NODE_ENV:', process.env.NODE_ENV);
console.log('[Env] GEMINI_API_KEY present:', !!apiKey);
console.log('[Env] GEMINI_API_KEY length:', apiKey?.length || 0);

if (!apiKey) {
  console.error('FATAL: GEMINI_API_KEY is missing or empty.');
  console.error('Expected location:', envPath);
  console.error('Please add your key to server/.env');
  console.error('Example: GEMINI_API_KEY=AQ...');
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { requestTimeout } from './middleware/requestTimeout.js';
import { requestId } from './middleware/requestId.js';
import { logger } from './utils/logger.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/errorHandler.js';
import { chatLimiter } from './middleware/rateLimiter.js';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(requestTimeout(Number(process.env.OPENAI_TIMEOUT_MS || 30000)));
app.use(requestId);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health/gemini', async (req, res) => {
  try {
    const { generateWithGemini } = await import('./config/gemini.js');
    const start = Date.now();
    const reply = await generateWithGemini({
      messages: [{ role: 'user', content: 'Say hi in one short sentence.' }],
    });
    const duration = Date.now() - start;
    res.json({
      status: 'ok',
      model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
      reply: reply.substring(0, 100),
      durationMs: duration,
    });
  } catch (error) {
    logger.error('Gemini health check failed', { error: error?.message });
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Gemini health check failed',
    });
  }
});

app.use('/api/chat', chatLimiter, chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info('Server running', { port: PORT, env: process.env.NODE_ENV });
});

const gracefulShutdown = () => {
  logger.info('Received shutdown signal. Closing server...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);