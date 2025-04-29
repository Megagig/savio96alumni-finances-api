import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../types';
import { upload } from '../config/cloudinary';

const router = Router();

// Get all payments with summary statistics
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.getAllPayments);

// Get pending payments
router.get('/pending', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.getPendingPayments);

// Get approved payments
router.get('/approved', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.getApprovedPayments);

// Export payments to Excel - support both GET and POST methods
router.get('/export/excel', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.exportToExcel);
router.post('/export/excel', paymentController.handleExportWithToken);

// Export payments to PDF - support both GET and POST methods
router.get('/export/pdf', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.exportToPDF);
router.post('/export/pdf', paymentController.handleExportWithToken);

// Get current user's payments - specific routes must come BEFORE parameterized routes
router.get('/my-payments', authenticate, paymentController.getMyPayments);
router.get('/user/my-payments', authenticate, paymentController.getMyPayments);
router.get('/user', authenticate, paymentController.getMyPayments);

// Get payments by member ID
router.get('/member/:userId', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.getPaymentsByUserId);

// Create new payment
router.post('/', authenticate, paymentController.createPayment);

// Admin payment on behalf of member
router.post('/admin-payment', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.adminPayment);

// Approve payment
router.put('/:id/approve', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.approvePayment);

// Reject payment
router.put('/:id/reject', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.rejectPayment);

// Update payment status
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN), paymentController.updatePaymentStatus);

// Upload payment receipt
router.patch('/:id/receipt', authenticate, upload.single('receipt'), paymentController.uploadPaymentReceipt);

// Add a dedicated upload route for the frontend
router.post('/upload', authenticate, upload.single('receipt'), paymentController.uploadFile);

// Get payment by ID - parameterized route should come AFTER specific routes
router.get('/:id', authenticate, paymentController.getPaymentById);

export default router;
