import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Register new user (admin level 1 and above)
router.post('/register', authenticate, authorize(UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.registerUser);

// Get all users (admin level 1 and above)
router.get('/', authenticate, authorize(UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.getAllUsers);

// Get all members (admin level 1 and above)
router.get('/members', authenticate, authorize(UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.getMembers);

// Export member details to Excel (admin level 1 and above)
router.get('/members/:userId/export/excel', authenticate, authorize(UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.exportMemberDetailsToExcel);

// Export member details to PDF (admin level 1 and above)
router.get('/members/:userId/export/pdf', authenticate, authorize(UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.exportMemberDetailsToPDF);

// Change user password
router.patch('/change-password', authenticate, userController.changePassword);

// Update user profile
router.put('/profile', authenticate, userController.updateProfile);

// Get notification settings
router.get('/notification-settings', authenticate, userController.getNotificationSettings);

// Update notification settings
router.put('/notification-settings', authenticate, userController.updateNotificationSettings);

// Update user role (super admin only)
router.patch('/:id/role', authenticate, authorize(UserRole.SUPER_ADMIN), userController.updateUserRole);

// Activate or deactivate user (super admin only)
router.patch('/:id/status', authenticate, authorize(UserRole.SUPER_ADMIN), userController.setUserActiveStatus);

// Get user by ID (admin or own user)
// Note: The controller handles the authorization check for non-admin users
router.get('/:id', authenticate, userController.getUserById);

// Update user (admin or own user)
// Note: The controller handles the authorization check for non-admin users
router.put('/:id', authenticate, userController.updateUser);

export default router;
