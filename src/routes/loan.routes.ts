import { Router } from 'express';
import * as loanController from '../controllers/loan.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Get all loans with summary statistics - Only Admin Level 2 and above can access loan management
router.get('/', authenticate, authorize(UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), loanController.getAllLoans);

// Get current user's loans - specific routes must come BEFORE parameterized routes
router.get('/my-loans', authenticate, loanController.getMyLoans);
router.get('/user/my-loans', authenticate, loanController.getMyLoans);

// Get loans by member ID - Only Admin Level 2 and above
router.get('/member/:userId', authenticate, authorize(UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), loanController.getLoansByUserId);

// Add endpoints for active loans and history
router.get('/active', authenticate, loanController.getActiveLoans);
router.get('/history', authenticate, loanController.getLoanHistory);

// Get loan by ID
router.get('/detail/:id', authenticate, loanController.getLoanById);

// Create new loan application
router.post('/', authenticate, loanController.createLoan);

// Approve loan - Only Admin Level 2 and above
router.put('/:id/approve', authenticate, authorize(UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), loanController.approveLoan);

// Reject loan - Only Admin Level 2 and above
router.put('/:id/reject', authenticate, authorize(UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), loanController.rejectLoan);

// Get loans by status - parameterized route should come AFTER specific routes - Only Admin Level 2 and above
router.get('/:status', authenticate, authorize(UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), loanController.getLoansByStatus);

export default router;
