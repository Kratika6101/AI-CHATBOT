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

const express = await import('express');
const cors = await import('cors');
const helmet = await import('helmet');
const morgan = await import('morgan');
const { requestTimeout } = await import('./middleware/requestTimeout.js');

const app = express.default();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';

app.use(
  cors.default({
    origin: allowedOrigins === '*' ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(helmet.default());
app.use(morgan.default('combined'));
app.use(express.default.json({ limit: '1mb' }));
app.use(requestTimeout(Number(process.env.OPENAI_TIMEOUT_MS || 30000)));

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
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      reply: reply.substring(0, 100),
      durationMs: duration,
    });
  } catch (error) {
    console.error('[Health] Gemini check failed:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Gemini health check failed',
    });
  }
});

const { chatLimiter } = await import('./middleware/rateLimiter.js');
const { notFound, errorHandler } = await import('./middleware/errorHandler.js');
const chatRoutes = await import('./routes/chatRoutes.js');

app.use('/api/chat', chatLimiter, chatRoutes.default || chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    const { generateWithGemini } = await import('./config/gemini.js');
    const start = Date.now();
    await generateWithGemini({
      messages: [{ role: 'user', content: 'Say hi in one short sentence.' }],
    });
    const duration = Date.now() - start;
    console.log(`[Startup] Gemini connectivity verified in ${duration}ms`);
  } catch (error) {
    console.error('[Startup] Gemini connectivity check FAILED:', error?.message);
    console.error('[Startup] Chat will return fallback replies until Gemini is reachable.');
  }
});

const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);