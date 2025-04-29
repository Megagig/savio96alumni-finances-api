import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Get all transactions
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.getAllTransactions);

// Get transaction summary
router.get('/summary', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.getTransactionSummary);

// Export to Excel
router.get('/export/excel', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.exportToExcel);

// Export to PDF
router.get('/export/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.exportToPDF);

// Get income transactions
router.get('/income', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.getIncomeTransactions);

// Get expense transactions
router.get('/expense', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.getExpenseTransactions);
// Add plural route for backward compatibility
router.get('/expenses', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.getExpenseTransactions);

// Get balance transactions
router.get('/balance', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.getBalanceTransactions);

// Get transaction by ID
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.getTransactionById);

// Create transaction
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.createTransaction);

// Update transaction
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), transactionController.deleteTransaction);

export default router;
