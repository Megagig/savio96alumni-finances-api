"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.resendVerification = exports.verifyEmail = exports.forgotPassword = exports.getCurrentUser = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = req.body;
        const { user, token } = yield authService.register(userData);
        (0, response_utils_1.sendSuccess)(res, 201, 'User registered successfully', { user, token });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new error_middleware_1.AppError('Please provide email and password', 400);
        }
        const { user, token } = yield authService.login(email, password);
        (0, response_utils_1.sendSuccess)(res, 200, 'Login successful', { user, token });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.getCurrentUser(req.user._id);
        (0, response_utils_1.sendSuccess)(res, 200, 'User profile retrieved successfully', { user });
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
/**
 * Forgot password - request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            throw new error_middleware_1.AppError('Please provide an email address', 400);
        }
        yield authService.forgotPassword(email);
        (0, response_utils_1.sendSuccess)(res, 200, 'Password reset email sent successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
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
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, token } = req.body;
        if (!email || !token) {
            throw new error_middleware_1.AppError('Please provide email and verification token', 400);
        }
        const result = yield authService.verifyEmail(email, token);
        (0, response_utils_1.sendSuccess)(res, 200, 'Email verified successfully', result);
    }
    catch (error) {
        next(error);
    }
});
exports.verifyEmail = verifyEmail;
/**
 * Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
const resendVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            throw new error_middleware_1.AppError('Please provide an email address', 400);
        }
        const result = yield authService.resendVerificationEmail(email);
        (0, response_utils_1.sendSuccess)(res, 200, 'Verification email sent successfully', result);
    }
    catch (error) {
        next(error);
    }
});
exports.resendVerification = resendVerification;
/**
 * Reset password with token
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        if (!token || !password) {
            throw new error_middleware_1.AppError('Please provide a token and new password', 400);
        }
        yield authService.resetPassword(token, password);
        (0, response_utils_1.sendSuccess)(res, 200, 'Password reset successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
