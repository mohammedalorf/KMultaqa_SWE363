import express from 'express';
import { pathToFileURL } from 'url';
import { closeDatabaseConnection, connectToDatabase } from './config/db.js';
import { env } from './config/env.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { clubRouter } from './modules/club/club.routes.js';
import { notificationRouter } from './modules/notifications/notification.routes.js';
import { studentRouter } from './modules/student/student.routes.js';
import { uploadRouter } from './modules/uploads/upload.routes.js';

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  const allowsAnyOrigin = env.corsOrigins.includes('*');

  if (allowsAnyOrigin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && env.corsOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ message: 'KMultaqa backend is running' });
  });

  app.use('/api/admin', adminRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/club', clubRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/student', studentRouter);
  app.use('/api/uploads', uploadRouter);

  app.use((req, res) => {
    res.status(404).json({
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode ?? 500;

    res.status(statusCode).json({
      message: error.message || 'Internal server error',
    });
  });

  return app;
}

export async function start() {
  await connectToDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
  });

  async function shutdown() {
    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  start().catch((error) => {
    console.error('Failed to start backend', error);
    process.exit(1);
  });
}
