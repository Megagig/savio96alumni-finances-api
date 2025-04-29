import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/user.model';
import * as userService from '../services/user.service';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import PaymentModel from '../models/payment.model';
import MemberDueModel from '../models/memberDue.model';
import MemberLevyModel from '../models/memberLevy.model';
import PledgeModel from '../models/pledge.model';
import LoanModel from '../models/loan.model';
import { UserRole, IUser, IPayment, IMemberDue, IMemberLevy, IPledge, ILoan } from '../types';
import bcrypt from 'bcryptjs';

/**
 * Register a new user (member)
 * @route POST /api/users/register
 * @access Private (Admin only)
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      occupation, 
      dateOfBirth, 
      password,
      role = UserRole.MEMBER 
    } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      throw new AppError('First name, last name, email, and password are required', 400);
    }
    
    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber: phone,
      address,
      occupation,
      dateOfBirth,
      password: hashedPassword,
      role,
      isActive: true,
      dateJoined: new Date()
    };
    
    const newUser = await userService.createUser(userData);
    
    sendSuccess(res, 201, 'User registered successfully', { user: newUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 * @route GET /api/users
 * @access Private (Admin only)
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getAllUsers();
    
    sendSuccess(res, 200, 'Users retrieved successfully', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin or own user)
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own profile or has admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    const isAdmin = adminRoles.includes(req.user.role as UserRole);
    
    if (!isAdmin && req.user._id.toString() !== id) {
      // For debugging
      console.log('User ID comparison:', {
        requestUserId: req.user._id.toString(),
        paramId: id,
        userRole: req.user.role,
        isAdmin: isAdmin
      });
      throw new AppError('Not authorized to access this user', 403);
    }
    
    const user = await userService.getUserById(id);
    
    sendSuccess(res, 200, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private (Admin or own user)
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user is updating their own profile or has admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    const isAdmin = adminRoles.includes(req.user.role as UserRole);
    
    if (!isAdmin && req.user._id.toString() !== id) {
      // For debugging
      console.log('User ID comparison for update:', {
        requestUserId: req.user._id.toString(),
        paramId: id,
        userRole: req.user.role,
        isAdmin: isAdmin
      });
      throw new AppError('Not authorized to update this user', 403);
    }
    
    const user = await userService.updateUser(id, updateData);
    
    sendSuccess(res, 200, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role (admin only)
 * @route PATCH /api/users/:id/role
 * @access Private (Admin only)
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    console.log('Updating user role:', { userId: id, newRole: role, requestBody: req.body });
    
    // Validate required fields
    if (!id) {
      throw new AppError('User ID is required', 400);
    }
    
    if (!role) {
      throw new AppError('Role is required', 400);
    }
    
    // Validate role value against UserRole enum
    if (!Object.values(UserRole).includes(role as UserRole)) {
      console.error('Invalid role value:', role);
      throw new AppError(`Invalid role value. Must be one of: ${Object.values(UserRole).join(', ')}`, 400);
    }
    
    // Prevent users from changing their own role
    if (id === req.user._id.toString()) {
      throw new AppError('You cannot change your own role', 403);
    }
    
    // Update user role
    const user = await userService.updateUserRole(id, role);
    
    // Log the role change
    console.log(`User role updated successfully: ${id} to ${role} by ${req.user._id}`);
    
    sendSuccess(res, 200, 'User role updated successfully', { user });
  } catch (error: any) {
    console.error('Error in updateUserRole controller:', error.message || error);
    next(error);
  }
};

/**
 * Activate or deactivate user
 * @route PATCH /api/users/:id/status
 * @access Private (Admin only)
 */
export const setUserActiveStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      throw new AppError('isActive status is required', 400);
    }
    
    const user = await userService.setUserActiveStatus(id, isActive);
    
    sendSuccess(res, 200, `User ${isActive ? 'activated' : 'deactivated'} successfully`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 * @route PATCH /api/users/change-password
 * @access Private
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }
    
    const result = await userService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    );
    
    sendSuccess(res, 200, 'Password changed successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all members (users with role 'member')
 * @route GET /api/users/members
 * @access Private (Admin only)
 */
/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phoneNumber, address } = req.body;
    
    // Create update object with only the fields that are provided
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    
    // Update user profile
    const user = await userService.updateUser(userId, updateData);
    
    sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    
    const result = await userService.getMembers(page, limit, search);
    
    sendSuccess(res, 200, 'Members retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification settings
 * @route PUT /api/users/notification-settings
 * @access Private
 */
export const updateNotificationSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const notificationSettings = req.body;
    
    // Update user notification settings
    await userService.updateNotificationSettings(userId, notificationSettings);
    
    sendSuccess(res, 200, 'Notification settings updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification settings
 * @route GET /api/users/notification-settings
 * @access Private
 */
export const getNotificationSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    
    // Get user notification settings
    const settings = await userService.getNotificationSettings(userId);
    
    sendSuccess(res, 200, 'Notification settings retrieved successfully', { settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Export member details to Excel
 * @route GET /api/users/members/:userId/export/excel
 * @access Private (Admin only)
 */
export const exportMemberDetailsToExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // Get user details
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get all member data
    const payments = await PaymentModel.find({ user: userId }).sort({ paymentDate: -1 });
    const memberDues = await MemberDueModel.find({ user: userId }).populate('due');
    const memberLevies = await MemberLevyModel.find({ user: userId }).populate('levy');
    const pledges = await PledgeModel.find({ user: userId }).sort({ createdAt: -1 });
    const loans = await LoanModel.find({ user: userId }).sort({ createdAt: -1 });
    
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Financial Hub';
    workbook.created = new Date();
    
    // Add member info worksheet
    const infoSheet = workbook.addWorksheet('Member Information');
    infoSheet.columns = [
      { header: 'Field', key: 'field', width: 20 },
      { header: 'Value', key: 'value', width: 40 }
    ];
    
    // Add member details
    infoSheet.addRows([
      { field: 'Member ID', value: user.membershipId || 'Not assigned' },
      { field: 'Name', value: `${user.firstName} ${user.lastName}` },
      { field: 'Email', value: user.email },
      { field: 'Phone', value: user.phoneNumber || 'Not provided' },
      { field: 'Address', value: user.address || 'Not provided' },
      { field: 'Status', value: user.isActive ? 'Active' : 'Inactive' },
      { field: 'Member Since', value: new Date(user.dateJoined).toLocaleDateString() },
      { field: 'Account Created', value: new Date(user.createdAt).toLocaleDateString() }
    ]);
    
    // Style the info sheet
    infoSheet.getRow(1).font = { bold: true };
    infoSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add payments worksheet
    const paymentsSheet = workbook.addWorksheet('Payments');
    paymentsSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Receipt', key: 'receipt', width: 15 }
    ];
    
    // Add payment data
    payments.forEach((payment: IPayment) => {
      paymentsSheet.addRow({
        date: new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(),
        amount: `₦${payment.amount.toFixed(2)}`,
        description: payment.description || 'Payment',
        status: payment.status,
        receipt: payment.receiptUrl ? 'Yes' : 'No'
      });
    });
    
    // Style the payments sheet
    paymentsSheet.getRow(1).font = { bold: true };
    paymentsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add dues worksheet
    const duesSheet = workbook.addWorksheet('Dues');
    duesSheet.columns = [
      { header: 'Due Name', key: 'name', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Paid', key: 'paid', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 }
    ];
    
    // Add dues data
    memberDues.forEach((memberDue: IMemberDue) => {
      const dueName = memberDue.due ? (typeof memberDue.due === 'object' ? (memberDue.due as { name: string }).name : 'Unknown') : 'Unknown';
      duesSheet.addRow({
        name: dueName,
        amount: `₦${memberDue.amount.toFixed(2)}`,
        paid: `₦${memberDue.amountPaid.toFixed(2)}`,
        balance: `₦${memberDue.balance.toFixed(2)}`,
        status: memberDue.status,
        dueDate: memberDue.dueDate ? new Date(memberDue.dueDate).toLocaleDateString() : 'Not set'
      });
    });
    
    // Style the dues sheet
    duesSheet.getRow(1).font = { bold: true };
    duesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add levies worksheet
    const leviesSheet = workbook.addWorksheet('Levies');
    leviesSheet.columns = [
      { header: 'Levy Title', key: 'title', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Paid', key: 'paid', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Due Date', key: 'dueDate', width: 15 }
    ];
    
    // Add levies data
    memberLevies.forEach((memberLevy: IMemberLevy) => {
      const levyTitle = memberLevy.levy ? (typeof memberLevy.levy === 'object' ? (memberLevy.levy as { title: string }).title : 'Unknown') : 'Unknown';
      leviesSheet.addRow({
        title: levyTitle,
        amount: `₦${memberLevy.amount.toFixed(2)}`,
        paid: `₦${memberLevy.amountPaid.toFixed(2)}`,
        balance: `₦${memberLevy.balance.toFixed(2)}`,
        status: memberLevy.status,
        dueDate: memberLevy.dueDate ? new Date(memberLevy.dueDate).toLocaleDateString() : 'Not set'
      });
    });
    
    // Style the levies sheet
    leviesSheet.getRow(1).font = { bold: true };
    leviesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add pledges worksheet
    const pledgesSheet = workbook.addWorksheet('Pledges');
    pledgesSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Title', key: 'title', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Fulfillment Date', key: 'fulfillmentDate', width: 15 }
    ];
    
    // Add pledges data
    pledges.forEach((pledge: IPledge) => {
      pledgesSheet.addRow({
        date: new Date(pledge.pledgeDate || pledge.createdAt).toLocaleDateString(),
        title: pledge.title,
        amount: `₦${pledge.amount.toFixed(2)}`,
        status: pledge.status,
        fulfillmentDate: pledge.fulfillmentDate ? new Date(pledge.fulfillmentDate).toLocaleDateString() : 'Not fulfilled'
      });
    });
    
    // Style the pledges sheet
    pledgesSheet.getRow(1).font = { bold: true };
    pledgesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add loans worksheet
    const loansSheet = workbook.addWorksheet('Loans');
    loansSheet.columns = [
      { header: 'Application Date', key: 'date', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Purpose', key: 'purpose', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Repayment Date', key: 'repaymentDate', width: 15 }
    ];
    
    // Add loans data
    loans.forEach((loan: ILoan) => {
      loansSheet.addRow({
        date: new Date(loan.applicationDate || loan.createdAt).toLocaleDateString(),
        amount: `₦${loan.amount.toFixed(2)}`,
        purpose: loan.purpose,
        status: loan.status,
        repaymentDate: loan.repaymentDate ? new Date(loan.repaymentDate).toLocaleDateString() : 'Not set'
      });
    });
    
    // Style the loans sheet
    loansSheet.getRow(1).font = { bold: true };
    loansSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=member_${user.membershipId || userId}_details.xlsx`);
    
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting member details to Excel:', error);
    next(error);
  }
};

/**
 * Export member details to PDF
 * @route GET /api/users/members/:userId/export/pdf
 * @access Private (Admin only)
 */
export const exportMemberDetailsToPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // Get user details
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get all member data
    const payments = await PaymentModel.find({ user: userId }).sort({ paymentDate: -1 });
    const memberDues = await MemberDueModel.find({ user: userId }).populate('due');
    const memberLevies = await MemberLevyModel.find({ user: userId }).populate('levy');
    const pledges = await PledgeModel.find({ user: userId }).sort({ createdAt: -1 });
    const loans = await LoanModel.find({ user: userId }).sort({ createdAt: -1 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=member_${user.membershipId || userId}_details.pdf`);
    
    // Create PDF document
    const doc = new PDFDocument({ 
      autoFirstPage: true,
      margin: 50,
      bufferPages: true
    });
    
    // Pipe directly to response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Member Details Report', { align: 'center' });
    doc.moveDown();
    
    // Add member information
    doc.fontSize(16).text('Member Information');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Member ID: ${user.membershipId || 'Not assigned'}`);
    doc.text(`Name: ${user.firstName} ${user.lastName}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phoneNumber || 'Not provided'}`);
    doc.text(`Address: ${user.address || 'Not provided'}`);
    doc.text(`Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    doc.text(`Member Since: ${new Date(user.dateJoined).toLocaleDateString()}`);
    doc.text(`Account Created: ${new Date(user.createdAt).toLocaleDateString()}`);
    doc.moveDown();
    
    // Add payments section
    doc.fontSize(16).text('Payment History');
    doc.moveDown(0.5);
    
    if (payments.length === 0) {
      doc.fontSize(12).text('No payment records found.');
    } else {
      // Create simple payment table
      doc.fontSize(10);
      const paymentTableTop = doc.y;
      
      // Draw payment table headers
      doc.font('Helvetica-Bold');
      doc.text('Date', { continued: true, width: 80 });
      doc.text('Amount', { continued: true, width: 80 });
      doc.text('Description', { continued: true, width: 180 });
      doc.text('Status', { width: 80 });
      doc.font('Helvetica');
      
      // Draw payment rows
      payments.slice(0, 10).forEach((payment: IPayment) => { // Limit to 10 payments
        doc.text(
          new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(),
          { continued: true, width: 80 }
        );
        doc.text(
          `₦${payment.amount.toFixed(2)}`,
          { continued: true, width: 80 }
        );
        doc.text(
          payment.description || 'Payment',
          { continued: true, width: 180 }
        );
        doc.text(
          payment.status,
          { width: 80 }
        );
      });
      
      if (payments.length > 10) {
        doc.text(`... and ${payments.length - 10} more payments`);
      }
    }
    
    doc.moveDown(2);
    
    // Add dues section
    doc.fontSize(16).text('Dues');
    doc.moveDown(0.5);
    
    if (memberDues.length === 0) {
      doc.fontSize(12).text('No dues records found.');
    } else {
      // Create simple dues table
      doc.fontSize(10);
      
      // Draw dues table headers
      doc.font('Helvetica-Bold');
      doc.text('Due Name', { continued: true, width: 100 });
      doc.text('Amount', { continued: true, width: 80 });
      doc.text('Paid', { continued: true, width: 80 });
      doc.text('Balance', { continued: true, width: 80 });
      doc.text('Status', { width: 80 });
      doc.font('Helvetica');
      
      // Draw dues rows
      memberDues.forEach((memberDue: IMemberDue) => {
        const dueName = memberDue.due ? (typeof memberDue.due === 'object' ? (memberDue.due as { name: string }).name : 'Unknown') : 'Unknown';
        
        doc.text(dueName, { continued: true, width: 100 });
        doc.text(`₦${memberDue.amount.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(`₦${memberDue.amountPaid.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(`₦${memberDue.balance.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(memberDue.status, { width: 80 });
      });
    }
    
    // Add a new page for levies, pledges, and loans
    doc.addPage();
    
    // Add levies section
    doc.fontSize(16).text('Levies');
    doc.moveDown(0.5);
    
    if (memberLevies.length === 0) {
      doc.fontSize(12).text('No levies records found.');
    } else {
      // Create simple levies table
      doc.fontSize(10);
      
      // Draw levies table headers
      doc.font('Helvetica-Bold');
      doc.text('Levy Title', { continued: true, width: 100 });
      doc.text('Amount', { continued: true, width: 80 });
      doc.text('Paid', { continued: true, width: 80 });
      doc.text('Balance', { continued: true, width: 80 });
      doc.text('Status', { width: 80 });
      doc.font('Helvetica');
      
      // Draw levies rows
      memberLevies.forEach((memberLevy: IMemberLevy) => {
        const levyTitle = memberLevy.levy ? (typeof memberLevy.levy === 'object' ? (memberLevy.levy as { title: string }).title : 'Unknown') : 'Unknown';
        
        doc.text(levyTitle, { continued: true, width: 100 });
        doc.text(`₦${memberLevy.amount.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(`₦${memberLevy.amountPaid.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(`₦${memberLevy.balance.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(memberLevy.status, { width: 80 });
      });
    }
    
    doc.moveDown(2);
    
    // Add pledges section
    doc.fontSize(16).text('Pledges');
    doc.moveDown(0.5);
    
    if (pledges.length === 0) {
      doc.fontSize(12).text('No pledges records found.');
    } else {
      // Create simple pledges table
      doc.fontSize(10);
      
      // Draw pledges table headers
      doc.font('Helvetica-Bold');
      doc.text('Date', { continued: true, width: 80 });
      doc.text('Title', { continued: true, width: 150 });
      doc.text('Amount', { continued: true, width: 80 });
      doc.text('Status', { width: 80 });
      doc.font('Helvetica');
      
      // Draw pledges rows
      pledges.forEach((pledge: IPledge) => {
        doc.text(
          new Date(pledge.pledgeDate || pledge.createdAt).toLocaleDateString(),
          { continued: true, width: 80 }
        );
        doc.text(pledge.title, { continued: true, width: 150 });
        doc.text(`₦${pledge.amount.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(pledge.status, { width: 80 });
      });
    }
    
    doc.moveDown(2);
    
    // Add loans section
    doc.fontSize(16).text('Loans');
    doc.moveDown(0.5);
    
    if (loans.length === 0) {
      doc.fontSize(12).text('No loans records found.');
    } else {
      // Create simple loans table
      doc.fontSize(10);
      
      // Draw loans table headers
      doc.font('Helvetica-Bold');
      doc.text('Date', { continued: true, width: 80 });
      doc.text('Amount', { continued: true, width: 80 });
      doc.text('Purpose', { continued: true, width: 180 });
      doc.text('Status', { width: 80 });
      doc.font('Helvetica');
      
      // Draw loans rows
      loans.forEach((loan: ILoan) => {
        doc.text(
          new Date(loan.applicationDate || loan.createdAt).toLocaleDateString(),
          { continued: true, width: 80 }
        );
        doc.text(`₦${loan.amount.toFixed(2)}`, { continued: true, width: 80 });
        doc.text(loan.purpose, { continued: true, width: 180 });
        doc.text(loan.status, { width: 80 });
      });
    }
    
    // Add footer with date
    doc.fontSize(10).text(
      `Report generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      { align: 'center' }
    );
    
    // Finalize PDF and send response
    doc.end();
  } catch (error) {
    console.error('Error exporting member details to PDF:', error);
    next(error);
  }
};
