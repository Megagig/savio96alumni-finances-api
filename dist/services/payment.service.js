"use strict";
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
exports.uploadPaymentReceipt = exports.updatePaymentStatus = exports.getPaymentById = exports.getPaymentsByUserId = exports.getPaymentsByStatus = exports.getPaymentsWithFilters = exports.getAllPayments = exports.createPayment = void 0;
const payment_model_1 = __importDefault(require("../models/payment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Create a new payment
 * @param paymentData Payment data
 * @returns Created payment
 */
const createPayment = (paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user exists
    const userExists = yield user_model_1.default.findById(paymentData.user);
    if (!userExists) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    // Create payment
    const payment = yield payment_model_1.default.create(paymentData);
    return payment;
});
exports.createPayment = createPayment;
/**
 * Get all payments
 * @returns List of all payments
 */
const getAllPayments = () => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield payment_model_1.default.find()
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    return payments;
});
exports.getAllPayments = getAllPayments;
/**
 * Get payments with filters
 * @param filters Filter criteria
 * @returns List of filtered payments
 */
const getPaymentsWithFilters = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const payments = yield payment_model_1.default.find(filters)
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    return payments;
});
exports.getPaymentsWithFilters = getPaymentsWithFilters;
/**
 * Get payments by status
 * @param status Payment status
 * @param dateFilters Optional date filters
 * @returns List of payments with the specified status
 */
const getPaymentsByStatus = (status_1, ...args_1) => __awaiter(void 0, [status_1, ...args_1], void 0, function* (status, dateFilters = {}) {
    const filters = Object.assign({ status }, dateFilters);
    const payments = yield payment_model_1.default.find(filters)
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    return payments;
});
exports.getPaymentsByStatus = getPaymentsByStatus;
/**
 * Get payments by user ID
 * @param userId User ID
 * @returns List of user's payments
 */
const getPaymentsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield payment_model_1.default.find({ user: userId })
        .populate('approvedBy', 'firstName lastName')
        .sort({ createdAt: -1 });
    return payments;
});
exports.getPaymentsByUserId = getPaymentsByUserId;
/**
 * Get payment by ID
 * @param paymentId Payment ID
 * @returns Payment object
 */
const getPaymentById = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.default.findById(paymentId)
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName');
    if (!payment) {
        throw new error_middleware_1.AppError('Payment not found', 404);
    }
    return payment;
});
exports.getPaymentById = getPaymentById;
/**
 * Update payment status
 * @param paymentId Payment ID
 * @param status New status
 * @param adminId Admin user ID
 * @param rejectionReason Reason for rejection (if applicable)
 * @returns Updated payment
 */
const updatePaymentStatus = (paymentId, status, adminId, rejectionReason) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify admin exists
    const adminExists = yield user_model_1.default.findById(adminId);
    if (!adminExists) {
        throw new error_middleware_1.AppError('Admin user not found', 404);
    }
    // Find payment
    const payment = yield payment_model_1.default.findById(paymentId);
    if (!payment) {
        throw new error_middleware_1.AppError('Payment not found', 404);
    }
    // Update payment status
    const updateData = {
        status,
        approvedBy: adminId,
        approvedAt: new Date(),
    };
    // Add rejection reason if provided
    if (status === types_1.PaymentStatus.REJECTED && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
    }
    // Update payment
    const updatedPayment = yield payment_model_1.default.findByIdAndUpdate(paymentId, updateData, { new: true, runValidators: true }).populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName');
    // If payment is approved, create a transaction record
    if (status === types_1.PaymentStatus.APPROVED) {
        yield transaction_model_1.default.create({
            title: `Payment - ${payment.description}`,
            amount: payment.amount,
            type: types_1.TransactionType.INCOME,
            category: 'Payment',
            description: payment.description,
            date: new Date(),
            recordedBy: adminId,
            relatedPayment: paymentId,
        });
    }
    return updatedPayment;
});
exports.updatePaymentStatus = updatePaymentStatus;
/**
 * Upload payment receipt
 * @param paymentId Payment ID
 * @param receiptUrl URL of uploaded receipt
 * @returns Updated payment
 */
const uploadPaymentReceipt = (paymentId, receiptUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.default.findByIdAndUpdate(paymentId, { receiptUrl }, { new: true, runValidators: true });
    if (!payment) {
        throw new error_middleware_1.AppError('Payment not found', 404);
    }
    return payment;
});
exports.uploadPaymentReceipt = uploadPaymentReceipt;
