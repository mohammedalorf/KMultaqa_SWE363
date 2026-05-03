import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function loadEnvFile() {
  const currentFilePath = fileURLToPath(import.meta.url);
  const envFilePath = path.resolve(path.dirname(currentFilePath), '../../.env');

  let contents = '';

  try {
    contents = readFileSync(envFilePath, 'utf8');
  } catch {
    return;
  }

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

function getEnv(name, fallback = '') {
  return process.env[name] ?? fallback;
}

function getNumberEnv(name, fallback) {
  const value = Number(getEnv(name, fallback));

  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return value;
}

function getBooleanEnv(name, fallback = false) {
  const value = getEnv(name, String(fallback)).toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(value);
}

function getCorsOrigins() {
  return getEnv('CORS_ORIGIN', 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const nodeEnv = getEnv('NODE_ENV', 'development');
const jwtSecret = getEnv('JWT_SECRET', 'replace-with-a-long-random-secret');
const smtpEnabled = getBooleanEnv('SMTP_ENABLED', false);
const smtpUser = getEnv('SMTP_USER');
const smtpPass = getEnv('SMTP_PASS');
const smtpFrom = getEnv('SMTP_FROM', 'KMultaqa <no-reply@kmultaqa.local>');
const gmailApiEnabled = getBooleanEnv('GMAIL_API_ENABLED', false);
const emailDelivery = getEnv(
  'EMAIL_DELIVERY',
  gmailApiEnabled ? 'gmail-api' : smtpEnabled ? 'smtp' : 'console'
).toLowerCase();
const gmailApiUser = getEnv('GMAIL_USER', smtpUser);
const gmailApiClientId = getEnv('GMAIL_CLIENT_ID');
const gmailApiClientSecret = getEnv('GMAIL_CLIENT_SECRET');
const gmailApiRefreshToken = getEnv('GMAIL_REFRESH_TOKEN');
const corsOrigins = getCorsOrigins();
const cloudinaryCloudName = getEnv('CLOUDINARY_CLOUD_NAME');
const cloudinaryApiKey = getEnv('CLOUDINARY_API_KEY');
const cloudinaryApiSecret = getEnv('CLOUDINARY_API_SECRET');
const supportedEmailDeliveries = ['console', 'smtp', 'gmail-api'];

if (
  nodeEnv === 'production'
  && jwtSecret === 'replace-with-a-long-random-secret'
) {
  throw new Error('JWT_SECRET must be configured in production');
}

if (!supportedEmailDeliveries.includes(emailDelivery)) {
  throw new Error('EMAIL_DELIVERY must be one of: console, smtp, gmail-api');
}

if (emailDelivery === 'smtp' && (!smtpUser || !smtpPass)) {
  throw new Error('SMTP_USER and SMTP_PASS are required when EMAIL_DELIVERY=smtp');
}

if (
  emailDelivery === 'gmail-api'
  && (
    !gmailApiUser
    || !gmailApiClientId
    || !gmailApiClientSecret
    || !gmailApiRefreshToken
  )
) {
  throw new Error(
    'GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN are required when EMAIL_DELIVERY=gmail-api'
  );
}

export const env = {
  nodeEnv,
  port: getNumberEnv('PORT', 5000),
  mongoUri: getEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017'),
  databaseName: getEnv('MONGODB_DB_NAME', 'kmultaqa'),
  jwtSecret,
  jwtExpiresInSeconds: getNumberEnv('JWT_EXPIRES_IN_SECONDS', 86400),
  appTimeZone: getEnv('APP_TIME_ZONE', 'Asia/Riyadh'),
  appBaseUrl: getEnv('APP_BASE_URL', 'http://localhost:5000'),
  frontendBaseUrl: getEnv(
    'FRONTEND_BASE_URL',
    corsOrigins[0] ?? 'http://localhost:5173'
  ),
  corsOrigins,
  email: {
    delivery: emailDelivery,
  },
  smtp: {
    enabled: emailDelivery === 'smtp',
    host: getEnv('SMTP_HOST', 'smtp.gmail.com'),
    port: getNumberEnv('SMTP_PORT', 587),
    secure: getBooleanEnv('SMTP_SECURE', false),
    user: smtpUser,
    pass: smtpPass,
    from: smtpFrom,
  },
  gmailApi: {
    enabled: emailDelivery === 'gmail-api',
    user: gmailApiUser,
    clientId: gmailApiClientId,
    clientSecret: gmailApiClientSecret,
    refreshToken: gmailApiRefreshToken,
    from: getEnv('GMAIL_FROM', smtpFrom),
  },
  cloudinary: {
    cloudName: cloudinaryCloudName,
    apiKey: cloudinaryApiKey,
    apiSecret: cloudinaryApiSecret,
    folder: getEnv('CLOUDINARY_FOLDER', 'kmultaqa'),
    maxImageBytes: getNumberEnv('CLOUDINARY_MAX_IMAGE_BYTES', 5 * 1024 * 1024),
  },
  emailVerificationExpiresInSeconds: getNumberEnv(
    'EMAIL_VERIFICATION_EXPIRES_IN_SECONDS',
    600
  ),
  passwordSetupExpiresInSeconds: getNumberEnv(
    'PASSWORD_SETUP_EXPIRES_IN_SECONDS',
    86400
  ),
};
