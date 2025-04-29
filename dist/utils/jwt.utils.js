"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Generate JWT token for authenticated user
 * @param id User ID
 * @param role User role
 * @returns JWT token
 */
const generateToken = (id, role) => {
    // Get the JWT secret from environment variables
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    // Create payload object
    const payload = { id, role };
    // Create options object with proper typing
    // Using a properly typed expiresIn value
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    const options = { expiresIn };
    // Sign and return the JWT token
    return jsonwebtoken_1.default.sign(payload, jwtSecret, options);
};
exports.generateToken = generateToken;
