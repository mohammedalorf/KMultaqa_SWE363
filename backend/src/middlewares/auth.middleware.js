import { findUserById } from '../modules/auth/auth.service.js';
import { createError, verifyToken } from '../utils/jwt.js';

function getAuthenticatedRole(req) {
  if (req.auth?.role) {
    return req.auth.role;
  }

  const modelName = req.user?.constructor?.modelName;

  if (modelName === 'Student') {
    return 'student';
  }

  if (modelName === 'Club') {
    return 'club';
  }

  if (modelName === 'Admin') {
    return 'admin';
  }

  return req.user?.role;
}

export async function requireAuth(req, _res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw createError(401, 'Authorization token is required');
    }

    const token = authorizationHeader.slice(7);
    const payload = verifyToken(token);
    const user = await findUserById(payload.sub, payload.role);

    if (!user) {
      throw createError(401, 'Invalid token user');
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      next(createError(401, 'Authentication is required'));
      return;
    }

    if (!roles.includes(getAuthenticatedRole(req))) {
      next(createError(403, 'You do not have permission to access this resource'));
      return;
    }

    next();
  };
}
