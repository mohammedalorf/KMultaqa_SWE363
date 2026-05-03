import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import {
  loginUser,
  registerUser,
  resendVerificationEmail,
  sanitizeUser,
  getClubPasswordSetup,
  setupClubPassword,
  verifyEmailAddress,
} from './auth.service.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

async function handleVerifyEmail(req, res, next) {
  try {
    const code = req.body?.code ?? req.query?.code;
    const token = req.body?.token ?? req.query?.token;
    const result = await verifyEmailAddress({ code, token });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

authRouter.get('/verify-email', (_req, res) => {
  res.status(405).json({
    message: 'Open the app verification page and submit the code from the email.',
  });
});
authRouter.post('/verify-email', handleVerifyEmail);

authRouter.post('/resend-verification', async (req, res, next) => {
  try {
    const result = await resendVerificationEmail(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.get(
  '/club/setup-password/:token',
  async (req, res, next) => {
    try {
      const result = await getClubPasswordSetup({ token: req.params.token });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  '/club/setup-password',
  async (req, res, next) => {
    try {
      const result = await setupClubPassword(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    user: sanitizeUser(req.user),
  });
});
