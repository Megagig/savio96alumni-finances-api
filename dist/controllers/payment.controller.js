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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminPayment = exports.uploadFile = exports.handleExportWithToken = exports.uploadPaymentReceipt = exports.updatePaymentStatus = exports.getPaymentById = exports.getMyPayments = exports.getPaymentsByUserId = exports.exportToPDF = exports.exportToExcel = exports.rejectPayment = exports.approvePayment = exports.getApprovedPayments = exports.getPendingPayments = exports.getAllPayments = exports.createPayment = void 0;
const paymentService = __importStar(require("../services/payment.service"));
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const types_1 = require("../types");
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const memberDue_model_1 = __importDefault(require("../models/memberDue.model"));
const memberLevy_model_1 = __importDefault(require("../models/memberLevy.model"));
const pledge_model_1 = __importDefault(require("../models/pledge.model"));
/**
 * Create a new payment
 * @route POST /api/payments
 * @access Private
 */
const createPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentData = Object.assign(Object.assign({}, req.body), { user: req.user.role === 'admin' ? req.body.user : req.user._id });
        const payment = yield paymentService.createPayment(paymentData);
        (0, response_utils_1.sendSuccess)(res, 201, 'Payment created successfully', { payment });
    }
    catch (error) {
        next(error);
    }
});
exports.createPayment = createPayment;
/**
 * Get all payments with summary statistics
 * @route GET /api/payments
 * @access Private (Admin only)
 */
const getAllPayments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Parse date filters if provided
        const dateFilter = {};
        if (startDate) {
            dateFilter.paymentDate = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.paymentDate)
                dateFilter.paymentDate = {};
            dateFilter.paymentDate.$lte = new Date(endDate);
        }
        // Get payments with filters
        const payments = yield paymentService.getPaymentsWithFilters(dateFilter);
        // Calculate summary statistics
        const totalCollected = payments
            .filter((p) => p.status === types_1.PaymentStatus.APPROVED)
            .reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = payments.filter((p) => p.status === types_1.PaymentStatus.PENDING).length;
        const completedPayments = payments.filter((p) => p.status === types_1.PaymentStatus.APPROVED).length;
        (0, response_utils_1.sendSuccess)(res, 200, 'Payments retrieved successfully', {
            payments,
            totalCollected,
            pendingPayments,
            completedPayments
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllPayments = getAllPayments;
/**
 * Get pending payments with summary statistics
 * @route GET /api/payments/pending
 * @access Private (Admin only)
 */
const getPendingPayments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Parse date filters if provided
        const dateFilter = {};
        if (startDate) {
            dateFilter.paymentDate = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.paymentDate)
                dateFilter.paymentDate = {};
            dateFilter.paymentDate.$lte = new Date(endDate);
        }
        // Get pending payments with filters
        const payments = yield paymentService.getPaymentsByStatus(types_1.PaymentStatus.PENDING, dateFilter);
        // Calculate summary statistics
        const totalCollected = 0; // Pending payments haven't been collected yet
        const pendingPayments = payments.length;
        const completedPayments = 0; // We're only showing pending
        (0, response_utils_1.sendSuccess)(res, 200, 'Pending payments retrieved successfully', {
            payments,
            totalCollected,
            pendingPayments,
            completedPayments
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPendingPayments = getPendingPayments;
/**
 * Get approved payments with summary statistics
 * @route GET /api/payments/approved
 * @access Private (Admin only)
 */
const getApprovedPayments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Parse date filters if provided
        const dateFilter = {};
        if (startDate) {
            dateFilter.paymentDate = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.paymentDate)
                dateFilter.paymentDate = {};
            dateFilter.paymentDate.$lte = new Date(endDate);
        }
        // Get approved payments with filters
        const payments = yield paymentService.getPaymentsByStatus(types_1.PaymentStatus.APPROVED, dateFilter);
        // Calculate summary statistics
        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = 0; // We're only showing approved
        const completedPayments = payments.length;
        (0, response_utils_1.sendSuccess)(res, 200, 'Approved payments retrieved successfully', {
            payments,
            totalCollected,
            pendingPayments,
            completedPayments
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getApprovedPayments = getApprovedPayments;
/**
 * Approve a payment
 * @route PUT /api/payments/:id/approve
 * @access Private (Admin only)
 */
const approvePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payment = yield paymentService.updatePaymentStatus(id, types_1.PaymentStatus.APPROVED, req.user._id, undefined);
        (0, response_utils_1.sendSuccess)(res, 200, 'Payment approved successfully', { payment });
    }
    catch (error) {
        next(error);
    }
});
exports.approvePayment = approvePayment;
/**
 * Reject a payment
 * @route PUT /api/payments/:id/reject
 * @access Private (Admin only)
 */
const rejectPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const payment = yield paymentService.updatePaymentStatus(id, types_1.PaymentStatus.REJECTED, req.user._id, rejectionReason);
        (0, response_utils_1.sendSuccess)(res, 200, 'Payment rejected successfully', { payment });
    }
    catch (error) {
        next(error);
    }
});
exports.rejectPayment = rejectPayment;
/**
 * Export payments to Excel
 * @route GET /api/payments/export/excel
 * @access Private (Admin only)
 */
const exportToExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, status } = req.query;
        // Parse date filters if provided
        const dateFilter = {};
        if (startDate) {
            dateFilter.paymentDate = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.paymentDate)
                dateFilter.paymentDate = {};
            dateFilter.paymentDate.$lte = new Date(endDate);
        }
        // Add status filter if provided
        if (status && Object.values(types_1.PaymentStatus).includes(status)) {
            dateFilter.status = status;
        }
        // Get payments with filters
        const payments = yield paymentService.getPaymentsWithFilters(dateFilter);
        // Calculate summary statistics
        const totalCollected = payments
            .filter((p) => p.status === types_1.PaymentStatus.APPROVED)
            .reduce((sum, p) => sum + p.amount, 0);
        // Create Excel workbook and worksheet
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Payments');
        // Add title and date range
        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = 'Payment Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        worksheet.mergeCells('A2:F2');
        const dateRangeText = startDate && endDate
            ? `Date Range: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
            : 'All Dates';
        worksheet.getCell('A2').value = dateRangeText;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };
        // Add headers
        worksheet.addRow(['Member', 'Amount', 'Description', 'Date', 'Status', 'Receipt']);
        const headerRow = worksheet.lastRow;
        headerRow === null || headerRow === void 0 ? void 0 : headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        // Add payment data
        payments.forEach((payment) => {
            const user = payment.user;
            const memberName = typeof user === 'string'
                ? user
                : `${user.firstName} ${user.lastName}`;
            worksheet.addRow([
                memberName,
                `₦${payment.amount.toFixed(2)}`,
                payment.description,
                new Date(payment.paymentDate).toLocaleDateString(),
                payment.status,
                payment.receiptUrl ? 'Yes' : 'No'
            ]);
        });
        // Add summary section
        worksheet.addRow([]);
        worksheet.addRow(['Total Collected', '', '', '', `₦${totalCollected.toFixed(2)}`]);
        worksheet.addRow(['Total Payments', '', '', '', `${payments.length}`]);
        // Format columns
        worksheet.columns.forEach((column) => {
            column.width = 20;
        });
        // Set content type and disposition
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=payments.xlsx');
        // Write to response
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        next(error);
    }
});
exports.exportToExcel = exportToExcel;
/**
 * Export payments to PDF
 * @route GET /api/payments/export/pdf
 * @access Private (Admin only)
 */
const exportToPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate, status } = req.query;
        // Parse date filters if provided
        const dateFilter = {};
        if (startDate) {
            dateFilter.paymentDate = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.paymentDate)
                dateFilter.paymentDate = {};
            dateFilter.paymentDate.$lte = new Date(endDate);
        }
        // Add status filter if provided
        if (status && Object.values(types_1.PaymentStatus).includes(status)) {
            dateFilter.status = status;
        }
        // Get payments with filters
        const payments = yield paymentService.getPaymentsWithFilters(dateFilter);
        // Calculate summary statistics
        const totalCollected = payments
            .filter((p) => p.status === types_1.PaymentStatus.APPROVED)
            .reduce((sum, p) => sum + p.amount, 0);
        // Create PDF document
        const doc = new pdfkit_1.default({ margin: 50 });
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=payments.pdf');
        // Pipe PDF to response
        doc.pipe(res);
        // Add title
        doc.fontSize(20).text('Payment Report', { align: 'center' });
        doc.moveDown();
        // Add date range
        const dateRangeText = startDate && endDate
            ? `Date Range: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
            : 'All Dates';
        doc.fontSize(12).text(dateRangeText, { align: 'center' });
        doc.moveDown(2);
        // Add table headers
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = [150, 80, 120, 80, 80];
        doc.font('Helvetica-Bold');
        doc.text('Member', tableLeft, tableTop);
        doc.text('Amount', tableLeft + colWidths[0], tableTop);
        doc.text('Description', tableLeft + colWidths[0] + colWidths[1], tableTop);
        doc.text('Date', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
        doc.text('Status', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
        // Add horizontal line
        doc.moveTo(tableLeft, tableTop + 20)
            .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop + 20)
            .stroke();
        // Add payment data
        doc.font('Helvetica');
        let rowTop = tableTop + 30;
        payments.forEach((payment) => {
            const user = payment.user;
            const memberName = typeof user === 'string'
                ? user
                : `${user.firstName} ${user.lastName}`;
            doc.text(memberName, tableLeft, rowTop, { width: colWidths[0], ellipsis: true });
            doc.text(`₦${payment.amount.toFixed(2)}`, tableLeft + colWidths[0], rowTop);
            doc.text(payment.description, tableLeft + colWidths[0] + colWidths[1], rowTop, { width: colWidths[2], ellipsis: true });
            doc.text(new Date(payment.paymentDate).toLocaleDateString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);
            doc.text(payment.status, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowTop);
            rowTop += 20;
            // Add a new page if we're near the bottom
            if (rowTop > doc.page.height - 100) {
                doc.addPage();
                rowTop = 50;
            }
        });
        // Add summary section
        rowTop += 20;
        doc.font('Helvetica-Bold');
        doc.text(`Total Collected: ₦${totalCollected.toFixed(2)}`, tableLeft, rowTop);
        rowTop += 20;
        doc.text(`Total Payments: ${payments.length}`, tableLeft, rowTop);
        // Finalize PDF
        doc.end();
    }
    catch (error) {
        next(error);
    }
});
exports.exportToPDF = exportToPDF;
/**
 * Get payments by user ID
 * @route GET /api/payments/user/:userId
 * @access Private (Admin or own user)
 */
const getPaymentsByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user is requesting their own payments or is an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role) && req.user._id.toString() !== userId) {
            throw new error_middleware_1.AppError('Not authorized to access these payments', 403);
        }
        const payments = yield paymentService.getPaymentsByUserId(userId);
        (0, response_utils_1.sendSuccess)(res, 200, 'Payments retrieved successfully', { payments });
    }
    catch (error) {
        next(error);
    }
});
exports.getPaymentsByUserId = getPaymentsByUserId;
/**
 * Get current user's payments
 * @route GET /api/payments/my-payments
 * @access Private
 */
const getMyPayments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield paymentService.getPaymentsByUserId(req.user._id);
        (0, response_utils_1.sendSuccess)(res, 200, 'Payments retrieved successfully', { payments });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyPayments = getMyPayments;
/**
 * Get payment by ID
 * @route GET /api/payments/:id
 * @access Private (Admin or payment owner)
 */
const getPaymentById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payment = yield paymentService.getPaymentById(id);
        // Check if user is the payment owner or is admin
        if (req.user.role !== 'admin' &&
            payment.user._id.toString() !== req.user._id.toString()) {
            throw new error_middleware_1.AppError('Not authorized to access this payment', 403);
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Payment retrieved successfully', { payment });
    }
    catch (error) {
        next(error);
    }
});
exports.getPaymentById = getPaymentById;
/**
 * Update payment status
 * @route PATCH /api/payments/:id/status
 * @access Private (Admin only)
 */
const updatePaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        if (!status) {
            throw new error_middleware_1.AppError('Status is required', 400);
        }
        if (!Object.values(types_1.PaymentStatus).includes(status)) {
            throw new error_middleware_1.AppError('Invalid status', 400);
        }
        const payment = yield paymentService.updatePaymentStatus(id, status, req.user._id, rejectionReason);
        (0, response_utils_1.sendSuccess)(res, 200, `Payment ${status} successfully`, { payment });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePaymentStatus = updatePaymentStatus;
/**
 * Upload payment receipt
 * @route PATCH /api/payments/:id/receipt
 * @access Private (Admin or payment owner)
 */
const uploadPaymentReceipt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if file was uploaded
        if (!req.file) {
            throw new error_middleware_1.AppError('Please upload a receipt', 400);
        }
        // Get payment to check ownership
        const payment = yield paymentService.getPaymentById(id);
        // Check if user is the payment owner or is admin
        if (req.user.role !== 'admin' &&
            payment.user._id.toString() !== req.user._id.toString()) {
            throw new error_middleware_1.AppError('Not authorized to update this payment', 403);
        }
        // Get the Cloudinary URL from the uploaded file
        const receiptUrl = req.file.path;
        const updatedPayment = yield paymentService.uploadPaymentReceipt(id, receiptUrl);
        (0, response_utils_1.sendSuccess)(res, 200, 'Receipt uploaded successfully', { payment: updatedPayment });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadPaymentReceipt = uploadPaymentReceipt;
/**
 * Upload file to Cloudinary
 * @route POST /api/payments/upload
 * @access Private
 */
/**
 * Handle export with token from POST request
 * @route POST /api/payments/export/excel or /api/payments/export/pdf
 * @access Private (Admin only)
 */
const handleExportWithToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get token from request body
        const { token } = req.body;
        if (!token) {
            throw new error_middleware_1.AppError('Access denied. No token provided.', 401);
        }
        // Verify token and get user
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Get user from database
        const user = yield user_model_1.default.findById(decoded.id);
        if (!user) {
            throw new error_middleware_1.AppError('Invalid token. User not found.', 401);
        }
        // Check if user is admin
        if (user.role !== 'admin') {
            throw new error_middleware_1.AppError('Access denied. Admin privileges required.', 403);
        }
        // Attach user to request
        req.user = user;
        // Determine which export function to call based on the URL
        if (req.path.includes('/export/excel')) {
            return (0, exports.exportToExcel)(req, res, next);
        }
        else if (req.path.includes('/export/pdf')) {
            return (0, exports.exportToPDF)(req, res, next);
        }
        else {
            throw new error_middleware_1.AppError('Invalid export path', 400);
        }
    }
    catch (error) {
        next(error);
    }
});
exports.handleExportWithToken = handleExportWithToken;
const uploadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            throw new error_middleware_1.AppError('No file uploaded', 400);
        }
        const fileUrl = req.file.path;
        (0, response_utils_1.sendSuccess)(res, 200, 'File uploaded successfully', { fileUrl });
    }
    catch (error) {
        next(error);
    }
});
exports.uploadFile = uploadFile;
/**
 * Create payment by admin on behalf of a member
 * @route POST /api/payments/admin-payment
 * @access Private (Admin only)
 */
const adminPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user: userId, amount, paymentType, relatedItem, description, paymentDate, paymentMethod, referenceNumber } = req.body;
        // Validate required fields
        if (!userId || !amount || !paymentType) {
            throw new error_middleware_1.AppError('User ID, amount, and payment type are required', 400);
        }
        // Check if user exists
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        // Create payment data
        const paymentData = {
            user: userId,
            amount,
            paymentType,
            description: description || `Admin payment on behalf of ${user.firstName} ${user.lastName}`,
            paymentDate: paymentDate || new Date(),
            paymentMethod: paymentMethod || 'cash',
            referenceNumber,
            status: types_1.PaymentStatus.APPROVED, // Auto-approve admin payments
            approvedBy: req.user._id,
            approvedAt: new Date(),
            paidByAdmin: true
        };
        // Handle related item based on payment type
        if (paymentType !== types_1.PaymentType.DONATION && !relatedItem) {
            throw new error_middleware_1.AppError(`Related item is required for ${paymentType} payments`, 400);
        }
        if (relatedItem) {
            paymentData.relatedItem = relatedItem;
            // Update related item status based on payment type
            if (paymentType === types_1.PaymentType.DUE) {
                // Update member due status
                yield memberDue_model_1.default.findOneAndUpdate({ user: userId, due: relatedItem }, { status: 'paid', paidAmount: amount, paidDate: new Date() });
            }
            else if (paymentType === types_1.PaymentType.LEVY) {
                // Update member levy status
                yield memberLevy_model_1.default.findOneAndUpdate({ user: userId, levy: relatedItem }, { status: 'paid', paidAmount: amount, paidDate: new Date() });
            }
            else if (paymentType === types_1.PaymentType.PLEDGE) {
                // Update pledge status
                yield pledge_model_1.default.findByIdAndUpdate(relatedItem, {
                    $set: { status: 'fulfilled', fulfilledAmount: amount, fulfilledDate: new Date() }
                });
            }
        }
        // Create the payment
        const payment = yield paymentService.createPayment(paymentData);
        // Create transaction record
        yield transaction_model_1.default.create({
            user: userId,
            amount,
            type: types_1.TransactionType.CREDIT,
            description: paymentData.description,
            category: paymentType,
            reference: payment._id,
            date: paymentDate || new Date(),
        });
        (0, response_utils_1.sendSuccess)(res, 201, 'Payment recorded successfully', { payment });
    }
    catch (error) {
        next(error);
    }
});
exports.adminPayment = adminPayment;
