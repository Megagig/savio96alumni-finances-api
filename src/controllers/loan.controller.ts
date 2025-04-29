import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Loan from '../models/loan.model';
import User from '../models/user.model';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import { LoanStatus, ILoan, IUser, UserRole } from '../types';

// Define interfaces for populated documents
interface PopulatedLoan extends Omit<ILoan, 'user'> {
  user: IUser | mongoose.Types.ObjectId | string;
}

/**
 * Get all loans with summary statistics
 * @route GET /api/loans
 * @access Private (Admin only)
 */
export const getAllLoans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loans = await Loan.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Calculate summary statistics
    const totalActiveLoans = await Loan.countDocuments({ status: LoanStatus.APPROVED });
    const pendingApplications = await Loan.countDocuments({ status: LoanStatus.PENDING });
    const approvedLoans = await Loan.countDocuments({ status: LoanStatus.APPROVED });
    const rejectedLoans = await Loan.countDocuments({ status: LoanStatus.REJECTED });
    const defaultedLoans = await Loan.countDocuments({ status: LoanStatus.DEFAULTED });
    
    // Calculate repayment rate (percentage of loans that are not defaulted)
    const totalCompletedLoans = await Loan.countDocuments({ 
      status: { $in: [LoanStatus.APPROVED, LoanStatus.PAID, LoanStatus.DEFAULTED] } 
    });
    
    const paidLoans = await Loan.countDocuments({ status: LoanStatus.PAID });
    const repaymentRate = totalCompletedLoans > 0 
      ? Math.round((paidLoans / totalCompletedLoans) * 100) 
      : 100;

    sendSuccess(res, 200, 'Loans retrieved successfully', { 
      loans,
      totalActiveLoans,
      pendingApplications,
      repaymentRate,
      approvedLoans,
      rejectedLoans,
      defaultedLoans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loans by status
 * @route GET /api/loans/:status
 * @access Private (Admin only)
 */
export const getLoansByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.params;
    
    if (!Object.values(LoanStatus).includes(status as LoanStatus)) {
      throw new AppError('Invalid loan status', 400);
    }
    
    const loans = await Loan.find({ status })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Calculate summary statistics (same as getAllLoans)
    const totalActiveLoans = await Loan.countDocuments({ status: LoanStatus.APPROVED });
    const pendingApplications = await Loan.countDocuments({ status: LoanStatus.PENDING });
    const approvedLoans = await Loan.countDocuments({ status: LoanStatus.APPROVED });
    const rejectedLoans = await Loan.countDocuments({ status: LoanStatus.REJECTED });
    const defaultedLoans = await Loan.countDocuments({ status: LoanStatus.DEFAULTED });
    
    const totalCompletedLoans = await Loan.countDocuments({ 
      status: { $in: [LoanStatus.APPROVED, LoanStatus.PAID, LoanStatus.DEFAULTED] } 
    });
    
    const paidLoans = await Loan.countDocuments({ status: LoanStatus.PAID });
    const repaymentRate = totalCompletedLoans > 0 
      ? Math.round((paidLoans / totalCompletedLoans) * 100) 
      : 100;

    sendSuccess(res, 200, `${status} loans retrieved successfully`, { 
      loans,
      totalActiveLoans,
      pendingApplications,
      repaymentRate,
      approvedLoans,
      rejectedLoans,
      defaultedLoans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loan by ID
 * @route GET /api/loans/:id
 * @access Private (Admin or loan owner)
 */
export const getLoanById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid loan ID', 400);
    }
    
    // Find and populate the loan document
    const loan = await Loan.findById(id)
      .populate('user', 'firstName lastName email');
    
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    
    // Cast to our custom type for proper type checking
    const populatedLoan = loan as unknown as PopulatedLoan;
    
    // Check if user is the loan owner or has an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (!adminRoles.includes(req.user.role as UserRole)) {
      // Extract the user ID for comparison regardless of whether it's populated or not
      let userId: string;
      
      if (!populatedLoan.user) {
        throw new AppError('Loan user information is missing', 500);
      }
      
      if (typeof populatedLoan.user === 'string') {
        userId = populatedLoan.user;
      } else if (populatedLoan.user instanceof mongoose.Types.ObjectId) {
        userId = populatedLoan.user.toString();
      } else if (populatedLoan.user._id) {
        // It's a populated user document
        userId = populatedLoan.user._id.toString();
      } else {
        throw new AppError('Invalid user reference in loan', 500);
      }
      
      if (userId !== req.user._id.toString()) {
        throw new AppError('Not authorized to access this loan', 403);
      }
    }
    
    sendSuccess(res, 200, 'Loan retrieved successfully', { loan });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new loan application
 * @route POST /api/loans
 * @access Private
 */
export const createLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, purpose, durationInMonths, interestRate } = req.body;
    
    // Validate required fields
    if (!amount || !purpose || !durationInMonths) {
      throw new AppError('Please provide amount, purpose, and duration', 400);
    }
    
    // Create new loan with pending status
    const loanData = {
      user: req.user._id,
      amount,
      purpose,
      durationInMonths,
      interestRate: interestRate || 5, // Default interest rate if not provided
      status: LoanStatus.PENDING,
      applicationDate: new Date()
    };
    
    const loan = await Loan.create(loanData);
    
    // Populate user information
    const populatedLoan = await Loan.findById(loan._id)
      .populate('user', 'firstName lastName email');
    
    sendSuccess(res, 201, 'Loan application submitted successfully', { loan: populatedLoan });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a loan
 * @route PUT /api/loans/:id/approve
 * @access Private (Admin only)
 */
export const approveLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid loan ID', 400);
    }
    
    const loan = await Loan.findById(id);
    
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    
    if (loan.status !== LoanStatus.PENDING) {
      throw new AppError(`Loan cannot be approved because it is already ${loan.status}`, 400);
    }
    
    // Update loan status
    loan.status = LoanStatus.APPROVED;
    loan.approvedBy = req.user._id;
    loan.approvalDate = new Date();
    
    await loan.save();
    
    // Populate user information
    const updatedLoan = await Loan.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');
    
    sendSuccess(res, 200, 'Loan approved successfully', { loan: updatedLoan });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a loan
 * @route PUT /api/loans/:id/reject
 * @access Private (Admin only)
 */
export const rejectLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid loan ID', 400);
    }
    
    if (!rejectionReason) {
      throw new AppError('Rejection reason is required', 400);
    }
    
    const loan = await Loan.findById(id);
    
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    
    if (loan.status !== LoanStatus.PENDING) {
      throw new AppError(`Loan cannot be rejected because it is already ${loan.status}`, 400);
    }
    
    // Update loan status
    loan.status = LoanStatus.REJECTED;
    loan.rejectionReason = rejectionReason;
    loan.approvedBy = req.user._id; // Using the same field to track who rejected it
    loan.approvalDate = new Date(); // Using the same field to track rejection date
    
    await loan.save();
    
    // Populate user information
    const updatedLoan = await Loan.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');
    
    sendSuccess(res, 200, 'Loan rejected successfully', { loan: updatedLoan });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's loans
 * @route GET /api/loans/my-loans
 * @access Private
 */
export const getMyLoans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loans = await Loan.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    sendSuccess(res, 200, 'Your loans retrieved successfully', { loans });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active loans for the current user
 * @route GET /api/loans/active
 * @access Private
 */
export const getActiveLoans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loans = await Loan.find({
      user: req.user._id,
      status: { $in: [LoanStatus.PENDING, LoanStatus.APPROVED] }
    }).sort({ createdAt: -1 });
    
    sendSuccess(res, 200, 'Active loans retrieved successfully', { loans });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loan history for the current user
 * @route GET /api/loans/history
 * @access Private
 */
export const getLoanHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loans = await Loan.find({
      user: req.user._id,
      status: { $in: [LoanStatus.PAID, LoanStatus.REJECTED, LoanStatus.DEFAULTED] }
    })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Loan history retrieved successfully', { loans });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loans by user ID
 * @route GET /api/loans/member/:userId
 * @access Private (Admin only)
 */
export const getLoansByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // Check if user has an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (!adminRoles.includes(req.user.role as UserRole)) {
      throw new AppError('Not authorized to access these loans', 403);
    }
    
    // Validate that the user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      throw new AppError('User not found', 404);
    }
    
    // Get all loans for the specified user
    const loans = await Loan.find({ user: userId })
      .populate('user', 'firstName lastName email membershipId')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'User loans retrieved successfully', { loans });
  } catch (error) {
    console.error('Error fetching loans by user ID:', error);
    next(error);
  }
};
