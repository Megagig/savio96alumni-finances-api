import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user profile
router.get('/me', authenticate, authController.getCurrentUser);

// Email verification
router.post('/verify-email', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

// Forgot password - request password reset
router.post('/forgot-password', authController.forgotPassword);

// Reset password with token
router.post('/reset-password/:token', authController.resetPassword);

export default router;
