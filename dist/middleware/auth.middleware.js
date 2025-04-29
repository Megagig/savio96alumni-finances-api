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
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../types");
const user_model_1 = __importDefault(require("../models/user.model"));
// Authenticate user middleware
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get token from header or query parameter
        const authHeader = req.headers.authorization;
        const queryToken = req.query.token;
        // Check if token exists in either header or query parameter
        if ((!authHeader || !authHeader.startsWith('Bearer ')) && !queryToken) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        // Extract token from header or use query parameter
        const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))
            ? authHeader.split(' ')[1]
            : queryToken;
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Find user by id
        const user = yield user_model_1.default.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
            return;
        }
        // Check if user is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact admin.',
            });
            return;
        }
        // Set user in request object
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.',
        });
    }
});
exports.authenticate = authenticate;
// Authorize role middleware with role hierarchy support
const authorize = (...requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.',
            });
            return;
        }
        const userRole = req.user.role;
        // Check if user has one of the required roles or a higher role
        const hasPermission = checkRolePermission(userRole, requiredRoles);
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to access this resource.',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Helper function to check if a user role has permission based on role hierarchy
const checkRolePermission = (userRole, requiredRoles) => {
    // If the user's exact role is in the required roles, they have permission
    if (requiredRoles.includes(userRole)) {
        return true;
    }
    // Role hierarchy definitions
    const roleHierarchy = {
        [types_1.UserRole.MEMBER]: [],
        [types_1.UserRole.ADMIN_LEVEL_1]: [],
        [types_1.UserRole.ADMIN_LEVEL_2]: [types_1.UserRole.ADMIN_LEVEL_1],
        [types_1.UserRole.SUPER_ADMIN]: [types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.ADMIN],
        [types_1.UserRole.ADMIN]: [types_1.UserRole.ADMIN_LEVEL_1] // Legacy admin role has Level 1 access
    };
    // Check if the user's role inherits any of the required roles
    if (roleHierarchy[userRole]) {
        for (const requiredRole of requiredRoles) {
            if (roleHierarchy[userRole].includes(requiredRole)) {
                return true;
            }
        }
    }
    return false;
};
