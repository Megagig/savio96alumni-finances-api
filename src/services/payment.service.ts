import Payment from '../models/payment.model';
import User from '../models/user.model';
import Transaction from '../models/transaction.model';
import { IPayment, PaymentStatus, TransactionType } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new payment
 * @param paymentData Payment data
 * @returns Created payment
 */
export const createPayment = async (paymentData: Partial<IPayment>) => {
  // Verify user exists
  const userExists = await User.findById(paymentData.user);
  if (!userExists) {
    throw new AppError('User not found', 404);
  }

  // Create payment
  const payment = await Payment.create(paymentData);
  return payment;
};

/**
 * Get all payments
 * @returns List of all payments
 */
export const getAllPayments = async () => {
  const payments = await Payment.find()
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
  return payments;
};

/**
 * Get payments with filters
 * @param filters Filter criteria
 * @returns List of filtered payments
 */
export const getPaymentsWithFilters = async (filters: any = {}) => {
  const payments = await Payment.find(filters)
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
  return payments;
};

/**
 * Get payments by status
 * @param status Payment status
 * @param dateFilters Optional date filters
 * @returns List of payments with the specified status
 */
export const getPaymentsByStatus = async (status: PaymentStatus, dateFilters: any = {}) => {
  const filters = { status, ...dateFilters };
  const payments = await Payment.find(filters)
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
  return payments;
};

/**
 * Get payments by user ID
 * @param userId User ID
 * @returns List of user's payments
 */
export const getPaymentsByUserId = async (userId: string) => {
  const payments = await Payment.find({ user: userId })
    .populate('approvedBy', 'firstName lastName')
    .sort({ createdAt: -1 });
  return payments;
};

/**
 * Get payment by ID
 * @param paymentId Payment ID
 * @returns Payment object
 */
export const getPaymentById = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId)
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName');
  
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return payment;
};

/**
 * Update payment status
 * @param paymentId Payment ID
 * @param status New status
 * @param adminId Admin user ID
 * @param rejectionReason Reason for rejection (if applicable)
 * @returns Updated payment
 */
export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  adminId: string,
  rejectionReason?: string
) => {
  // Verify admin exists
  const adminExists = await User.findById(adminId);
  if (!adminExists) {
    throw new AppError('Admin user not found', 404);
  }

  // Find payment
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Update payment status
  const updateData: Partial<IPayment> = {
    status,
    approvedBy: adminId,
    approvedAt: new Date(),
  };

  // Add rejection reason if provided
  if (status === PaymentStatus.REJECTED && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  // Update payment
  const updatedPayment = await Payment.findByIdAndUpdate(
    paymentId,
    updateData,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName');

  // If payment is approved, create a transaction record
  if (status === PaymentStatus.APPROVED) {
    await Transaction.create({
      title: `Payment - ${payment.description}`,
      amount: payment.amount,
      type: TransactionType.INCOME,
      category: 'Payment',
      description: payment.description,
      date: new Date(),
      recordedBy: adminId,
      relatedPayment: paymentId,
    });
  }

  return updatedPayment;
};

/**
 * Upload payment receipt
 * @param paymentId Payment ID
 * @param receiptUrl URL of uploaded receipt
 * @returns Updated payment
 */
export const uploadPaymentReceipt = async (
  paymentId: string,
  receiptUrl: string
) => {
  const payment = await Payment.findByIdAndUpdate(
    paymentId,
    { receiptUrl },
    { new: true, runValidators: true }
  );

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return payment;
};
