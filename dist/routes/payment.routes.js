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
const paymentController = __importStar(require("../controllers/payment.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const cloudinary_1 = require("../config/cloudinary");
const router = (0, express_1.Router)();
// Get all payments with summary statistics
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.getAllPayments);
// Get pending payments
router.get('/pending', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.getPendingPayments);
// Get approved payments
router.get('/approved', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.getApprovedPayments);
// Export payments to Excel - support both GET and POST methods
router.get('/export/excel', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.exportToExcel);
router.post('/export/excel', paymentController.handleExportWithToken);
// Export payments to PDF - support both GET and POST methods
router.get('/export/pdf', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.exportToPDF);
router.post('/export/pdf', paymentController.handleExportWithToken);
// Get current user's payments - specific routes must come BEFORE parameterized routes
router.get('/my-payments', auth_middleware_1.authenticate, paymentController.getMyPayments);
router.get('/user/my-payments', auth_middleware_1.authenticate, paymentController.getMyPayments);
router.get('/user', auth_middleware_1.authenticate, paymentController.getMyPayments);
// Get payments by member ID
router.get('/member/:userId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.getPaymentsByUserId);
// Create new payment
router.post('/', auth_middleware_1.authenticate, paymentController.createPayment);
// Admin payment on behalf of member
router.post('/admin-payment', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.adminPayment);
// Approve payment
router.put('/:id/approve', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.approvePayment);
// Reject payment
router.put('/:id/reject', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.rejectPayment);
// Update payment status
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), paymentController.updatePaymentStatus);
// Upload payment receipt
router.patch('/:id/receipt', auth_middleware_1.authenticate, cloudinary_1.upload.single('receipt'), paymentController.uploadPaymentReceipt);
// Add a dedicated upload route for the frontend
router.post('/upload', auth_middleware_1.authenticate, cloudinary_1.upload.single('receipt'), paymentController.uploadFile);
// Get payment by ID - parameterized route should come AFTER specific routes
router.get('/:id', auth_middleware_1.authenticate, paymentController.getPaymentById);
exports.default = router;
