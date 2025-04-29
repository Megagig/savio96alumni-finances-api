import Loan from '../models/loan.model';
import LoanRepayment from '../models/loanRepayment.model';
import User from '../models/user.model';
import { ILoan, ILoanRepayment, LoanStatus, PaymentStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new loan application
 * @param loanData Loan data
 * @returns Created loan
 */
export const createLoan = async (loanData: Partial<ILoan>) => {
  // Verify user exists
  const userExists = await User.findById(loanData.user);
  if (!userExists) {
    throw new AppError('User not found', 404);
  }

  // Create loan
  const loan = await Loan.create({
    ...loanData,
    status: LoanStatus.PENDING,
  });
  
  return loan;
};

/**
 * Get all loans
 * @returns List of all loans
 */
export const getAllLoans = async () => {
  const loans = await Loan.find()
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName')
    .sort({ applicationDate: -1 });
  return loans;
};

/**
 * Get loans by user ID
 * @param userId User ID
 * @returns List of user's loans
 */
export const getLoansByUserId = async (userId: string) => {
  const loans = await Loan.find({ user: userId })
    .populate('approvedBy', 'firstName lastName')
    .sort({ applicationDate: -1 });
  return loans;
};

/**
 * Get loan by ID
 * @param loanId Loan ID
 * @returns Loan object
 */
export const getLoanById = async (loanId: string) => {
  const loan = await Loan.findById(loanId)
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName');
  
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  return loan;
};

/**
 * Update loan status
 * @param loanId Loan ID
 * @param status New status
 * @param adminId Admin user ID
 * @param rejectionReason Reason for rejection (if applicable)
 * @returns Updated loan
 */
export const updateLoanStatus = async (
  loanId: string,
  status: LoanStatus,
  adminId: string,
  rejectionReason?: string
) => {
  // Verify admin exists
  const adminExists = await User.findById(adminId);
  if (!adminExists) {
    throw new AppError('Admin user not found', 404);
  }

  // Find loan
  const loan = await Loan.findById(loanId);
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  // Update loan status
  const updateData: Partial<ILoan> = {
    status,
    approvedBy: adminId,
  };

  // Add approval date if approved
  if (status === LoanStatus.APPROVED) {
    updateData.approvalDate = new Date();
  }

  // Add rejection reason if provided
  if (status === LoanStatus.REJECTED && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  // Update loan
  const updatedLoan = await Loan.findByIdAndUpdate(
    loanId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName');

  return updatedLoan;
};

/**
 * Create a loan repayment
 * @param repaymentData Loan repayment data
 * @returns Created loan repayment
 */
export const createLoanRepayment = async (repaymentData: Partial<ILoanRepayment>) => {
  // Verify loan exists
  const loan = await Loan.findById(repaymentData.loan);
  if (!loan) {
    throw new AppError('Loan not found', 404);
  }

  // Verify user exists and matches loan user
  if ((loan.user as any).toString() !== repaymentData.user?.toString()) {
    throw new AppError('User does not match loan owner', 400);
  }

  // Create repayment
  const repayment = await LoanRepayment.create({
    ...repaymentData,
    status: PaymentStatus.PENDING,
  });
  
  return repayment;
};

/**
 * Get all loan repayments
 * @returns List of all loan repayments
 */
export const getAllLoanRepayments = async () => {
  const repayments = await LoanRepayment.find()
    .populate('loan')
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName')
    .sort({ repaymentDate: -1 });
  return repayments;
};

/**
 * Get loan repayments by loan ID
 * @param loanId Loan ID
 * @returns List of loan's repayments
 */
export const getLoanRepaymentsByLoanId = async (loanId: string) => {
  const repayments = await LoanRepayment.find({ loan: loanId })
    .populate('approvedBy', 'firstName lastName')
    .sort({ repaymentDate: -1 });
  return repayments;
};

/**
 * Get loan repayment by ID
 * @param repaymentId Loan repayment ID
 * @returns Loan repayment object
 */
export const getLoanRepaymentById = async (repaymentId: string) => {
  const repayment = await LoanRepayment.findById(repaymentId)
    .populate('loan')
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName');
  
  if (!repayment) {
    throw new AppError('Loan repayment not found', 404);
  }

  return repayment;
};

/**
 * Update loan repayment status
 * @param repaymentId Loan repayment ID
 * @param status New status
 * @param adminId Admin user ID
 * @param rejectionReason Reason for rejection (if applicable)
 * @returns Updated loan repayment
 */
export const updateLoanRepaymentStatus = async (
  repaymentId: string,
  status: PaymentStatus,
  adminId: string,
  rejectionReason?: string
) => {
  // Verify admin exists
  const adminExists = await User.findById(adminId);
  if (!adminExists) {
    throw new AppError('Admin user not found', 404);
  }

  // Find repayment
  const repayment = await LoanRepayment.findById(repaymentId);
  if (!repayment) {
    throw new AppError('Loan repayment not found', 404);
  }

  // Update repayment status
  const updateData: Partial<ILoanRepayment> = {
    status,
    approvedBy: adminId,
    approvedAt: new Date(),
  };

  // Add rejection reason if provided
  if (status === PaymentStatus.REJECTED && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  // Update repayment
  const updatedRepayment = await LoanRepayment.findByIdAndUpdate(
    repaymentId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('loan')
    .populate('user', 'firstName lastName email membershipId')
    .populate('approvedBy', 'firstName lastName');

  // If repayment is approved, check if loan is fully repaid
  if (status === PaymentStatus.APPROVED) {
    const loan = await Loan.findById(repayment.loan);
    if (loan) {
      // Get all approved repayments for this loan
      const approvedRepayments = await LoanRepayment.find({
        loan: loan._id,
        status: PaymentStatus.APPROVED,
      });

      // Calculate total repaid amount
      const totalRepaid = approvedRepayments.reduce(
        (sum, rep) => sum + rep.amount,
        0
      );

      // If total repaid is greater than or equal to loan amount, mark loan as paid
      if (totalRepaid >= loan.amount) {
        await Loan.findByIdAndUpdate(loan._id, {
          status: LoanStatus.PAID,
          repaymentDate: new Date(),
        });
      }
    }
  }

  return updatedRepayment;
};

/**
 * Upload loan repayment receipt
 * @param repaymentId Loan repayment ID
 * @param receiptUrl URL of uploaded receipt
 * @returns Updated loan repayment
 */
export const uploadLoanRepaymentReceipt = async (
  repaymentId: string,
  receiptUrl: string
) => {
  const repayment = await LoanRepayment.findByIdAndUpdate(
    repaymentId,
    { receiptUrl },
    { new: true, runValidators: true }
  );

  if (!repayment) {
    throw new AppError('Loan repayment not found', 404);
  }

  return repayment;
};
