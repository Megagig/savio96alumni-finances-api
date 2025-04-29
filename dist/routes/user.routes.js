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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController = __importStar(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Register new user (admin level 1 and above)
router.post('/register', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN), userController.registerUser);
// Get all users (admin level 1 and above)
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN), userController.getAllUsers);
// Get all members (admin level 1 and above)
router.get('/members', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN), userController.getMembers);
// Export member details to Excel (admin level 1 and above)
router.get('/members/:userId/export/excel', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN), userController.exportMemberDetailsToExcel);
// Export member details to PDF (admin level 1 and above)
router.get('/members/:userId/export/pdf', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN), userController.exportMemberDetailsToPDF);
// Change user password
router.patch('/change-password', auth_middleware_1.authenticate, userController.changePassword);
// Update user profile
router.put('/profile', auth_middleware_1.authenticate, userController.updateProfile);
// Get notification settings
router.get('/notification-settings', auth_middleware_1.authenticate, userController.getNotificationSettings);
// Update notification settings
router.put('/notification-settings', auth_middleware_1.authenticate, userController.updateNotificationSettings);
// Update user role (super admin only)
router.patch('/:id/role', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), userController.updateUserRole);
// Activate or deactivate user (super admin only)
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.SUPER_ADMIN), userController.setUserActiveStatus);
// Get user by ID (admin or own user)
// Note: The controller handles the authorization check for non-admin users
router.get('/:id', auth_middleware_1.authenticate, userController.getUserById);
// Update user (admin or own user)
// Note: The controller handles the authorization check for non-admin users
router.put('/:id', auth_middleware_1.authenticate, userController.updateUser);
exports.default = router;
