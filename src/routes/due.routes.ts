import { Router } from 'express';
import * as dueController from '../controllers/due.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Member dues routes - must come before /:id routes to avoid conflicts
// Get all member dues
router.get('/members', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), dueController.getAllMemberDues);

// Get current user's dues
router.get('/members/my-dues', authenticate, dueController.getMyDues);

// Get member dues by user ID
router.get('/members/user/:userId', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), dueController.getMemberDuesByUserId);

// Get member due by ID
router.get('/members/:id', authenticate, dueController.getMemberDueById);

// Update member due
router.put('/members/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), dueController.updateMemberDue);

// Regular dues routes
// Get all dues
router.get('/', authenticate, dueController.getAllDues);

// Get unpaid dues
router.get('/unpaid', authenticate, dueController.getUnpaidDues);

// Create new due
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), dueController.createDue);

// Get due by ID - must come after all other GET routes with specific paths
router.get('/:id', authenticate, dueController.getDueById);

// Update due
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), dueController.updateDue);

// Delete due
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), dueController.deleteDue);

export default router;
