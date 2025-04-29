"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const types_1 = require("../types");
// Check if user is admin middleware
const isAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.',
        });
        return;
    }
    // Check if user has any admin role
    const adminRoles = [
        types_1.UserRole.ADMIN,
        types_1.UserRole.ADMIN_LEVEL_1,
        types_1.UserRole.ADMIN_LEVEL_2,
        types_1.UserRole.SUPER_ADMIN
    ];
    if (!adminRoles.includes(req.user.role)) {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.',
        });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
