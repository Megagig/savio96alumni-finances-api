import { Router } from 'express';
import * as pledgeController from '../controllers/pledge.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Get all pledges
router.get('/', authenticate, pledgeController.getAllPledges);

// Get current user's pledges - specific routes must come BEFORE parameterized routes
router.get('/my-pledges', authenticate, pledgeController.getMyPledges);

// Get pledges by member ID
router.get('/member/:userId', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), pledgeController.getPledgesByUserId);

// Create new pledge
router.post('/', authenticate, pledgeController.createPledge);

// The following routes have URL parameters and should come AFTER specific routes

// Update pledge
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), pledgeController.updatePledge);

// Delete pledge
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), pledgeController.deletePledge);

// Get pledge by ID - parameterized route should come AFTER specific routes
router.get('/:id', authenticate, pledgeController.getPledgeById);

export default router;
