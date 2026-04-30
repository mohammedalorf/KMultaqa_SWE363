import crypto from 'crypto';
import { env } from '../config/env.js';

export function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padding), 'base64').toString('utf8');
}

function createSignature(unsignedToken) {
  return crypto
    .createHmac('sha256', env.jwtSecret)
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signToken(payload) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = {
    ...payload,
    iat: now,
    exp: now + env.jwtExpiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedBody = toBase64Url(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedBody}`;

  return `${unsignedToken}.${createSignature(unsignedToken)}`;
}

export function verifyToken(token) {
  if (typeof token !== 'string') {
    throw createError(401, 'Invalid token');
  }

  const parts = token.split('.');

  if (parts.length !== 3) {
    throw createError(401, 'Malformed token');
  }

  const [encodedHeader, encodedBody, signature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = createSignature(unsignedToken);
  const actualSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    actualSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(actualSignature, expectedSignatureBuffer)
  ) {
    throw createError(401, 'Invalid token signature');
  }

  let header;
  let payload;

  try {
    header = JSON.parse(fromBase64Url(encodedHeader));
    payload = JSON.parse(fromBase64Url(encodedBody));
  } catch {
    throw createError(401, 'Invalid token payload');
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw createError(401, 'Unsupported token header');
  }

  if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw createError(401, 'Token has expired');
  }

  return payload;
}
