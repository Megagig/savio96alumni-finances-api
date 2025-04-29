import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData = req.body;
    const { user, token } = await authService.register(userData);
    
    sendSuccess(res, 201, 'User registered successfully', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }
    
    const { user, token } = await authService.login(email, password);
    
    sendSuccess(res, 200, 'Login successful', { user, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    
    sendSuccess(res, 200, 'User profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password - request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError('Please provide an email address', 400);
    }
    
    await authService.forgotPassword(email);
    
    sendSuccess(res, 200, 'Password reset email sent successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
/**
 * Verify user email
 * @route POST /api/auth/verify-email
 * @access Public
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      throw new AppError('Please provide email and verification token', 400);
    }
    
    const result = await authService.verifyEmail(email, token);
    
    sendSuccess(res, 200, 'Email verified successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError('Please provide an email address', 400);
    }
    
    const result = await authService.resendVerificationEmail(email);
    
    sendSuccess(res, 200, 'Verification email sent successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
      throw new AppError('Please provide a token and new password', 400);
    }
    
    await authService.resetPassword(token, password);
    
    sendSuccess(res, 200, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};
