import { Router } from 'express';
import {
  changePassword,
  getProfile,
  login,
  register,
  updateProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authenticationRateLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validators/authSchemas.js';

const authRouter = Router();

authRouter.post(
  '/register',
  authenticationRateLimiter,
  validate(registerSchema),
  register,
);
authRouter.post(
  '/login',
  authenticationRateLimiter,
  validate(loginSchema),
  login,
);
authRouter.get('/me', authenticate, getProfile);
authRouter.put(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  updateProfile,
);
authRouter.put(
  '/password',
  authenticate,
  authenticationRateLimiter,
  validate(changePasswordSchema),
  changePassword,
);

export default authRouter;
