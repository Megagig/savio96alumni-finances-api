import { Router } from 'express';
import * as levyController from '../controllers/levy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';
import { Request, Response, NextFunction } from 'express';

// Fix for Express route handler return type
type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Wrapper to ensure controller functions return void
const wrapController = (fn: any): ExpressHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

const router = Router();

// Member levies routes - must come before /:id routes to avoid conflicts
// Get all member levies
router.get('/members', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), levyController.getAllMemberLevies);

// Get current user's levies
router.get('/members/my-levies', authenticate, levyController.getMyLevies);

// Get member levies by user ID
router.get('/members/user/:userId', authenticate, wrapController(levyController.getMemberLeviesByUserId));

// Get member levy by ID
router.get('/members/:id', authenticate, wrapController(levyController.getMemberLevyById));

// Update member levy
router.put('/members/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), wrapController(levyController.updateMemberLevy));

// Regular levies routes
// Get all levies
router.get('/', authenticate, levyController.getAllLevies);

// Create new levy
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), levyController.createLevy);

// Get levy by ID - must come after all other GET routes with specific paths
router.get('/:id', authenticate, wrapController(levyController.getLevyById));

// Update levy
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), wrapController(levyController.updateLevy));

// Delete levy
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), wrapController(levyController.deleteLevy));

export default router;
