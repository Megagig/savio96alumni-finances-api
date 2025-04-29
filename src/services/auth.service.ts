import User from '../models/user.model';
import { IUser, UserRole } from '../types';
import { generateToken } from '../utils/jwt.utils';
import { AppError } from '../middleware/error.middleware';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.utils';

/**
 * Generate email verification token
 * @returns Object containing the token and hashed token
 */
const generateVerificationToken = () => {
  // Generate random token
  const verificationToken = crypto.randomBytes(3).toString('hex').toUpperCase();
  
  // Hash token to store in database
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  // Set expiration time (1 hour from now)
  const expiresIn = Date.now() + 60 * 60 * 1000;
  
  return { verificationToken, hashedToken, expiresIn };
};

/**
 * Register a new user
 * @param userData User data for registration
 * @returns Newly created user and token
 */
export const register = async (userData: Partial<IUser>) => {
  // Check if user with email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Generate verification token
  const { verificationToken, hashedToken, expiresIn } = generateVerificationToken();

  // Create new user with verification token
  const user = await User.create({
    ...userData,
    role: userData.role || UserRole.MEMBER, // Default role is member
    isEmailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(expiresIn)
  });

  // Generate JWT token
  const token = generateToken((user._id as any).toString(), user.role);

  // Remove password from response
  const userResponse = user.toObject();
  // Create a new object without the password
  const userWithoutPassword = { ...userResponse };
  if ('password' in userWithoutPassword) {
    delete (userWithoutPassword as any).password;
  }

  // Send verification email
  try {
    // Build verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
    
    // Import the sendVerificationEmail function from resend utils
    const { sendVerificationEmail, generateVerificationEmailHTML } = require('../utils/resend.utils');
    
    // Generate HTML content for the email
    const htmlContent = generateVerificationEmailHTML(
      `${user.firstName} ${user.lastName}`,
      verificationToken,
      verificationUrl
    );
    
    // Send email with verification token using Resend
    await sendVerificationEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: htmlContent
    });
    
    console.log('Verification email sent successfully using Resend');
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Continue with registration even if email fails
  }

  return { user: userWithoutPassword, token, verificationToken };
};

/**
 * Login user
 * @param email User email
 * @param password User password
 * @returns Authenticated user and token
 */
export const login = async (email: string, password: string) => {
  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact admin.', 403);
  }

  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  
  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    // Generate a new verification token if needed
    let verificationToken = '';
    
    // Check if token is expired or doesn't exist
    if (!user.emailVerificationToken || !user.emailVerificationExpires || 
        user.emailVerificationExpires < new Date()) {
      // Generate new token
      const { verificationToken: newToken, hashedToken, expiresIn } = generateVerificationToken();
      verificationToken = newToken;
      
      // Update user with new token
      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = new Date(expiresIn);
      await user.save({ validateBeforeSave: false });
      
      // Send new verification email
      try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
        
        // Import the sendVerificationEmail function from resend utils
        const { sendVerificationEmail, generateVerificationEmailHTML } = require('../utils/resend.utils');
        
        // Generate HTML content for the email
        const htmlContent = generateVerificationEmailHTML(
          `${user.firstName} ${user.lastName}`,
          verificationToken,
          verificationUrl
        );
        
        // Send email with verification token using Resend
        await sendVerificationEmail({
          to: user.email,
          subject: 'Verify Your Email Address',
          html: htmlContent
        });
        
        console.log('Verification email sent successfully using Resend');
      } catch (error) {
        console.error('Error sending verification email:', error);
      }
    }
    
    throw new AppError('Please verify your email address before logging in', 403, { requiresVerification: true });
  }
  
  // Generate JWT token
  const token = generateToken((user._id as any).toString(), user.role);
  
  // Remove password from response
  const userResponse = user.toObject();
  const userWithoutPassword = { ...userResponse };
  if ('password' in userWithoutPassword) {
    delete (userWithoutPassword as any).password;
  }
  
  return { user: userWithoutPassword, token };
};

/**
 * Get current user profile
 * @param userId User ID
 * @returns User profile
 */
export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Request password reset
 * @param email User email
 */
export const forgotPassword = async (email: string) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new AppError('No user found with that email address', 404);
  }

  // Generate random reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (10 minutes)
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
    Forgot your password? 
    Please use the following link to reset your password: ${resetURL}
    This link is valid for 10 minutes.
    If you didn't request this, please ignore this email.
  `;

  try {
    // Import the email functions from resend utils (same as used in verification emails)
    const { sendVerificationEmail, generatePasswordResetEmailHTML } = require('../utils/resend.utils');
    
    // Generate HTML content for the password reset email
    const htmlContent = generatePasswordResetEmailHTML(
      `${user.firstName} ${user.lastName}`,
      resetURL
    );
    
    // Send email with reset link using Resend
    await sendVerificationEmail({
      to: user.email,
      subject: 'Reset Your Password (valid for 10 minutes)',
      html: htmlContent
    });
    
    console.log('Password reset email sent successfully using Resend');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('There was an error sending the email. Try again later.', 500);
  }
};

/**
 * Reset password with token
 * @param token Reset password token
 * @param newPassword New password
 */
/**
 * Verify user email with token
 * @param email User email
 * @param token Verification token
 */
export const verifyEmail = async (email: string, token: string) => {
  if (!email || !token) {
    throw new AppError('Email and verification token are required', 400);
  }

  // Hash the token to compare with the stored hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with the token and check if token has not expired
  const user = await User.findOne({
    email,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  // Update user as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return { message: 'Email verified successfully' };
};

/**
 * Resend verification email
 * @param email User email
 */
export const resendVerificationEmail = async (email: string) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new verification token
  const { verificationToken, hashedToken, expiresIn } = generateVerificationToken();

  // Update user with new token
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = new Date(expiresIn);
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

    // Import the sendVerificationEmail function from resend utils
    const { sendVerificationEmail, generateVerificationEmailHTML } = require('../utils/resend.utils');
    
    // Generate HTML content for the email
    const htmlContent = generateVerificationEmailHTML(
      `${user.firstName} ${user.lastName}`,
      verificationToken,
      verificationUrl
    );
    
    // Send email with verification token using Resend
    await sendVerificationEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: htmlContent
    });

    console.log('Verification email sent successfully using Resend');
    return { message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending verification email with Resend:', error);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('There was an error sending the verification email. Try again later.', 500);
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  // Hash the token to compare with the stored hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with the token and check if token has not expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return true;
};
