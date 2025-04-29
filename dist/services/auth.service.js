"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.resendVerificationEmail = exports.verifyEmail = exports.forgotPassword = exports.getCurrentUser = exports.login = exports.register = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const jwt_utils_1 = require("../utils/jwt.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate email verification token
 * @returns Object containing the token and hashed token
 */
const generateVerificationToken = () => {
    // Generate random token
    const verificationToken = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
    // Hash token to store in database
    const hashedToken = crypto_1.default
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
const register = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user with email already exists
    const existingUser = yield user_model_1.default.findOne({ email: userData.email });
    if (existingUser) {
        throw new error_middleware_1.AppError('User with this email already exists', 400);
    }
    // Generate verification token
    const { verificationToken, hashedToken, expiresIn } = generateVerificationToken();
    // Create new user with verification token
    const user = yield user_model_1.default.create(Object.assign(Object.assign({}, userData), { role: userData.role || types_1.UserRole.MEMBER, isEmailVerified: false, emailVerificationToken: hashedToken, emailVerificationExpires: new Date(expiresIn) }));
    // Generate JWT token
    const token = (0, jwt_utils_1.generateToken)(user._id.toString(), user.role);
    // Remove password from response
    const userResponse = user.toObject();
    // Create a new object without the password
    const userWithoutPassword = Object.assign({}, userResponse);
    if ('password' in userWithoutPassword) {
        delete userWithoutPassword.password;
    }
    // Send verification email
    try {
        // Build verification URL
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
        // Import the sendVerificationEmail function from resend utils
        const { sendVerificationEmail, generateVerificationEmailHTML } = require('../utils/resend.utils');
        // Generate HTML content for the email
        const htmlContent = generateVerificationEmailHTML(`${user.firstName} ${user.lastName}`, verificationToken, verificationUrl);
        // Send email with verification token using Resend
        yield sendVerificationEmail({
            to: user.email,
            subject: 'Verify Your Email Address',
            html: htmlContent
        });
        console.log('Verification email sent successfully using Resend');
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        // Continue with registration even if email fails
    }
    return { user: userWithoutPassword, token, verificationToken };
});
exports.register = register;
/**
 * Login user
 * @param email User email
 * @param password User password
 * @returns Authenticated user and token
 */
const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // Find user by email
    const user = yield user_model_1.default.findOne({ email }).select('+password');
    if (!user) {
        throw new error_middleware_1.AppError('Invalid email or password', 401);
    }
    // Check if user is active
    if (!user.isActive) {
        throw new error_middleware_1.AppError('Your account has been deactivated. Please contact admin.', 403);
    }
    // Check if password is correct
    const isPasswordCorrect = yield user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new error_middleware_1.AppError('Invalid email or password', 401);
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
            yield user.save({ validateBeforeSave: false });
            // Send new verification email
            try {
                const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
                // Import the sendVerificationEmail function from resend utils
                const { sendVerificationEmail, generateVerificationEmailHTML } = require('../utils/resend.utils');
                // Generate HTML content for the email
                const htmlContent = generateVerificationEmailHTML(`${user.firstName} ${user.lastName}`, verificationToken, verificationUrl);
                // Send email with verification token using Resend
                yield sendVerificationEmail({
                    to: user.email,
                    subject: 'Verify Your Email Address',
                    html: htmlContent
                });
                console.log('Verification email sent successfully using Resend');
            }
            catch (error) {
                console.error('Error sending verification email:', error);
            }
        }
        throw new error_middleware_1.AppError('Please verify your email address before logging in', 403, { requiresVerification: true });
    }
    // Generate JWT token
    const token = (0, jwt_utils_1.generateToken)(user._id.toString(), user.role);
    // Remove password from response
    const userResponse = user.toObject();
    const userWithoutPassword = Object.assign({}, userResponse);
    if ('password' in userWithoutPassword) {
        delete userWithoutPassword.password;
    }
    return { user: userWithoutPassword, token };
});
exports.login = login;
/**
 * Get current user profile
 * @param userId User ID
 * @returns User profile
 */
const getCurrentUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    return user;
});
exports.getCurrentUser = getCurrentUser;
/**
 * Request password reset
 * @param email User email
 */
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    // Find user by email
    const user = yield user_model_1.default.findOne({ email });
    if (!user) {
        throw new error_middleware_1.AppError('No user found with that email address', 404);
    }
    // Generate random reset token
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    // Set expire time (10 minutes)
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    yield user.save({ validateBeforeSave: false });
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
        const htmlContent = generatePasswordResetEmailHTML(`${user.firstName} ${user.lastName}`, resetURL);
        // Send email with reset link using Resend
        yield sendVerificationEmail({
            to: user.email,
            subject: 'Reset Your Password (valid for 10 minutes)',
            html: htmlContent
        });
        console.log('Password reset email sent successfully using Resend');
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        throw new error_middleware_1.AppError('There was an error sending the email. Try again later.', 500);
    }
});
exports.forgotPassword = forgotPassword;
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
const verifyEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email || !token) {
        throw new error_middleware_1.AppError('Email and verification token are required', 400);
    }
    // Hash the token to compare with the stored hashed token
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(token)
        .digest('hex');
    // Find user with the token and check if token has not expired
    const user = yield user_model_1.default.findOne({
        email,
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) {
        throw new error_middleware_1.AppError('Invalid or expired verification token', 400);
    }
    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    yield user.save({ validateBeforeSave: false });
    return { message: 'Email verified successfully' };
});
exports.verifyEmail = verifyEmail;
/**
 * Resend verification email
 * @param email User email
 */
const resendVerificationEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new error_middleware_1.AppError('Email is required', 400);
    }
    // Find user by email
    const user = yield user_model_1.default.findOne({ email });
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    if (user.isEmailVerified) {
        throw new error_middleware_1.AppError('Email is already verified', 400);
    }
    // Generate new verification token
    const { verificationToken, hashedToken, expiresIn } = generateVerificationToken();
    // Update user with new token
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(expiresIn);
    yield user.save({ validateBeforeSave: false });
    // Send verification email
    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
        // Import the sendVerificationEmail function from resend utils
        const { sendVerificationEmail, generateVerificationEmailHTML } = require('../utils/resend.utils');
        // Generate HTML content for the email
        const htmlContent = generateVerificationEmailHTML(`${user.firstName} ${user.lastName}`, verificationToken, verificationUrl);
        // Send email with verification token using Resend
        yield sendVerificationEmail({
            to: user.email,
            subject: 'Verify Your Email Address',
            html: htmlContent
        });
        console.log('Verification email sent successfully using Resend');
        return { message: 'Verification email sent successfully' };
    }
    catch (error) {
        console.error('Error sending verification email with Resend:', error);
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        yield user.save({ validateBeforeSave: false });
        throw new error_middleware_1.AppError('There was an error sending the verification email. Try again later.', 500);
    }
});
exports.resendVerificationEmail = resendVerificationEmail;
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    // Hash the token to compare with the stored hashed token
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(token)
        .digest('hex');
    // Find user with the token and check if token has not expired
    const user = yield user_model_1.default.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
        throw new error_middleware_1.AppError('Token is invalid or has expired', 400);
    }
    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    yield user.save();
    return true;
});
exports.resetPassword = resetPassword;
