import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import { PaymentStatus, IPayment, TransactionType, PaymentType, UserRole } from '../types';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Transaction from '../models/transaction.model';
import { cloudinary } from '../config/cloudinary';
import User from '../models/user.model';
import Due from '../models/due.model';
import MemberDue from '../models/memberDue.model';
import Levy from '../models/levy.model';
import MemberLevy from '../models/memberLevy.model';
import Pledge from '../models/pledge.model';

/**
 * Create a new payment
 * @route POST /api/payments
 * @access Private
 */
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentData = {
      ...req.body,
      user: req.user.role === 'admin' ? req.body.user : req.user._id,
    };
    
    const payment = await paymentService.createPayment(paymentData);
    
    sendSuccess(res, 201, 'Payment created successfully', { payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payments with summary statistics
 * @route GET /api/payments
 * @access Private (Admin only)
 */
export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse date filters if provided
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.paymentDate = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      if (!dateFilter.paymentDate) dateFilter.paymentDate = {};
      dateFilter.paymentDate.$lte = new Date(endDate as string);
    }
    
    // Get payments with filters
    const payments = await paymentService.getPaymentsWithFilters(dateFilter);
    
    // Calculate summary statistics
    const totalCollected = payments
      .filter((p: IPayment) => p.status === PaymentStatus.APPROVED)
      .reduce((sum: number, p: IPayment) => sum + p.amount, 0);
      
    const pendingPayments = payments.filter((p: IPayment) => p.status === PaymentStatus.PENDING).length;
    const completedPayments = payments.filter((p: IPayment) => p.status === PaymentStatus.APPROVED).length;
    
    sendSuccess(res, 200, 'Payments retrieved successfully', { 
      payments,
      totalCollected,
      pendingPayments,
      completedPayments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending payments with summary statistics
 * @route GET /api/payments/pending
 * @access Private (Admin only)
 */
export const getPendingPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse date filters if provided
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.paymentDate = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      if (!dateFilter.paymentDate) dateFilter.paymentDate = {};
      dateFilter.paymentDate.$lte = new Date(endDate as string);
    }
    
    // Get pending payments with filters
    const payments = await paymentService.getPaymentsByStatus(PaymentStatus.PENDING, dateFilter);
    
    // Calculate summary statistics
    const totalCollected = 0; // Pending payments haven't been collected yet
    const pendingPayments = payments.length;
    const completedPayments = 0; // We're only showing pending
    
    sendSuccess(res, 200, 'Pending payments retrieved successfully', { 
      payments,
      totalCollected,
      pendingPayments,
      completedPayments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get approved payments with summary statistics
 * @route GET /api/payments/approved
 * @access Private (Admin only)
 */
export const getApprovedPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Parse date filters if provided
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.paymentDate = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      if (!dateFilter.paymentDate) dateFilter.paymentDate = {};
      dateFilter.paymentDate.$lte = new Date(endDate as string);
    }
    
    // Get approved payments with filters
    const payments = await paymentService.getPaymentsByStatus(PaymentStatus.APPROVED, dateFilter);
    
    // Calculate summary statistics
    const totalCollected = payments.reduce((sum: number, p: IPayment) => sum + p.amount, 0);
    const pendingPayments = 0; // We're only showing approved
    const completedPayments = payments.length;
    
    sendSuccess(res, 200, 'Approved payments retrieved successfully', { 
      payments,
      totalCollected,
      pendingPayments,
      completedPayments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a payment
 * @route PUT /api/payments/:id/approve
 * @access Private (Admin only)
 */
export const approvePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const payment = await paymentService.updatePaymentStatus(
      id,
      PaymentStatus.APPROVED,
      req.user._id,
      undefined
    );
    
    sendSuccess(res, 200, 'Payment approved successfully', { payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a payment
 * @route PUT /api/payments/:id/reject
 * @access Private (Admin only)
 */
export const rejectPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const payment = await paymentService.updatePaymentStatus(
      id,
      PaymentStatus.REJECTED,
      req.user._id,
      rejectionReason
    );
    
    sendSuccess(res, 200, 'Payment rejected successfully', { payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Export payments to Excel
 * @route GET /api/payments/export/excel
 * @access Private (Admin only)
 */
export const exportToExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Parse date filters if provided
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.paymentDate = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      if (!dateFilter.paymentDate) dateFilter.paymentDate = {};
      dateFilter.paymentDate.$lte = new Date(endDate as string);
    }
    
    // Add status filter if provided
    if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      dateFilter.status = status;
    }
    
    // Get payments with filters
    const payments = await paymentService.getPaymentsWithFilters(dateFilter);
    
    // Calculate summary statistics
    const totalCollected = payments
      .filter((p: IPayment) => p.status === PaymentStatus.APPROVED)
      .reduce((sum: number, p: IPayment) => sum + p.amount, 0);
    
    // Create Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payments');
    
    // Add title and date range
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'Payment Report';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    
    worksheet.mergeCells('A2:F2');
    const dateRangeText = startDate && endDate 
      ? `Date Range: ${new Date(startDate as string).toLocaleDateString()} to ${new Date(endDate as string).toLocaleDateString()}`
      : 'All Dates';
    worksheet.getCell('A2').value = dateRangeText;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    
    // Add headers
    worksheet.addRow(['Member', 'Amount', 'Description', 'Date', 'Status', 'Receipt']);
    const headerRow = worksheet.lastRow;
    headerRow?.eachCell((cell) => {
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
    payments.forEach((payment: IPayment) => {
      const user = payment.user as any;
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
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * Export payments to PDF
 * @route GET /api/payments/export/pdf
 * @access Private (Admin only)
 */
export const exportToPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Parse date filters if provided
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.paymentDate = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      if (!dateFilter.paymentDate) dateFilter.paymentDate = {};
      dateFilter.paymentDate.$lte = new Date(endDate as string);
    }
    
    // Add status filter if provided
    if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      dateFilter.status = status;
    }
    
    // Get payments with filters
    const payments = await paymentService.getPaymentsWithFilters(dateFilter);
    
    // Calculate summary statistics
    const totalCollected = payments
      .filter((p: IPayment) => p.status === PaymentStatus.APPROVED)
      .reduce((sum: number, p: IPayment) => sum + p.amount, 0);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
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
      ? `Date Range: ${new Date(startDate as string).toLocaleDateString()} to ${new Date(endDate as string).toLocaleDateString()}`
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
    
    payments.forEach((payment: IPayment) => {
      const user = payment.user as any;
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get payments by user ID
 * @route GET /api/payments/user/:userId
 * @access Private (Admin or own user)
 */
export const getPaymentsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own payments or is an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (!adminRoles.includes(req.user.role as UserRole) && req.user._id.toString() !== userId) {
      throw new AppError('Not authorized to access these payments', 403);
    }
    
    const payments = await paymentService.getPaymentsByUserId(userId);
    
    sendSuccess(res, 200, 'Payments retrieved successfully', { payments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's payments
 * @route GET /api/payments/my-payments
 * @access Private
 */
export const getMyPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payments = await paymentService.getPaymentsByUserId(req.user._id);
    
    sendSuccess(res, 200, 'Payments retrieved successfully', { payments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment by ID
 * @route GET /api/payments/:id
 * @access Private (Admin or payment owner)
 */
export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const payment = await paymentService.getPaymentById(id);
    
    // Check if user is the payment owner or is admin
    if (
      req.user.role !== 'admin' &&
      (payment.user as any)._id.toString() !== req.user._id.toString()
    ) {
      throw new AppError('Not authorized to access this payment', 403);
    }
    
    sendSuccess(res, 200, 'Payment retrieved successfully', { payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Update payment status
 * @route PATCH /api/payments/:id/status
 * @access Private (Admin only)
 */
export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    if (!status) {
      throw new AppError('Status is required', 400);
    }
    
    if (!Object.values(PaymentStatus).includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    
    const payment = await paymentService.updatePaymentStatus(
      id,
      status,
      req.user._id,
      rejectionReason
    );
    
    sendSuccess(res, 200, `Payment ${status} successfully`, { payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload payment receipt
 * @route PATCH /api/payments/:id/receipt
 * @access Private (Admin or payment owner)
 */
export const uploadPaymentReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      throw new AppError('Please upload a receipt', 400);
    }
    
    // Get payment to check ownership
    const payment = await paymentService.getPaymentById(id);
    
    // Check if user is the payment owner or is admin
    if (
      req.user.role !== 'admin' &&
      (payment.user as any)._id.toString() !== req.user._id.toString()
    ) {
      throw new AppError('Not authorized to update this payment', 403);
    }
    
    // Get the Cloudinary URL from the uploaded file
    const receiptUrl = req.file.path;
    
    const updatedPayment = await paymentService.uploadPaymentReceipt(id, receiptUrl);
    
    sendSuccess(res, 200, 'Receipt uploaded successfully', { payment: updatedPayment });
  } catch (error) {
    next(error);
  }
};

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
export const handleExportWithToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from request body
    const { token } = req.body;
    
    if (!token) {
      throw new AppError('Access denied. No token provided.', 401);
    }
    
    // Verify token and get user
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new AppError('Invalid token. User not found.', 401);
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      throw new AppError('Access denied. Admin privileges required.', 403);
    }
    
    // Attach user to request
    req.user = user;
    
    // Determine which export function to call based on the URL
    if (req.path.includes('/export/excel')) {
      return exportToExcel(req, res, next);
    } else if (req.path.includes('/export/pdf')) {
      return exportToPDF(req, res, next);
    } else {
      throw new AppError('Invalid export path', 400);
    }
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }
    
    const fileUrl = req.file.path;
    
    sendSuccess(res, 200, 'File uploaded successfully', { fileUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * Create payment by admin on behalf of a member
 * @route POST /api/payments/admin-payment
 * @access Private (Admin only)
 */
export const adminPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user: userId, amount, paymentType, relatedItem, description, paymentDate, paymentMethod, referenceNumber } = req.body;
    
    // Validate required fields
    if (!userId || !amount || !paymentType) {
      throw new AppError('User ID, amount, and payment type are required', 400);
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Create payment data
    const paymentData: any = {
      user: userId,
      amount,
      paymentType,
      description: description || `Admin payment on behalf of ${user.firstName} ${user.lastName}`,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || 'cash',
      referenceNumber,
      status: PaymentStatus.APPROVED, // Auto-approve admin payments
      approvedBy: req.user._id,
      approvedAt: new Date(),
      paidByAdmin: true
    };
    
    // Handle related item based on payment type
    if (paymentType !== PaymentType.DONATION && !relatedItem) {
      throw new AppError(`Related item is required for ${paymentType} payments`, 400);
    }
    
    if (relatedItem) {
      paymentData.relatedItem = relatedItem;
      
      // Update related item status based on payment type
      if (paymentType === PaymentType.DUE) {
        // Update member due status
        await MemberDue.findOneAndUpdate(
          { user: userId, due: relatedItem },
          { status: 'paid', paidAmount: amount, paidDate: new Date() }
        );
      } else if (paymentType === PaymentType.LEVY) {
        // Update member levy status
        await MemberLevy.findOneAndUpdate(
          { user: userId, levy: relatedItem },
          { status: 'paid', paidAmount: amount, paidDate: new Date() }
        );
      } else if (paymentType === PaymentType.PLEDGE) {
        // Update pledge status
        await Pledge.findByIdAndUpdate(relatedItem, {
          $set: { status: 'fulfilled', fulfilledAmount: amount, fulfilledDate: new Date() }
        });
      }
    }
    
    // Create the payment
    const payment = await paymentService.createPayment(paymentData);
    
    // Create transaction record
    await Transaction.create({
      user: userId,
      amount,
      type: TransactionType.CREDIT,
      description: paymentData.description,
      category: paymentType,
      reference: payment._id,
      date: paymentDate || new Date(),
    });
    
    sendSuccess(res, 201, 'Payment recorded successfully', { payment });
  } catch (error) {
    next(error);
  }
};
