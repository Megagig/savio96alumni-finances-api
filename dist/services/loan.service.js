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
exports.uploadLoanRepaymentReceipt = exports.updateLoanRepaymentStatus = exports.getLoanRepaymentById = exports.getLoanRepaymentsByLoanId = exports.getAllLoanRepayments = exports.createLoanRepayment = exports.updateLoanStatus = exports.getLoanById = exports.getLoansByUserId = exports.getAllLoans = exports.createLoan = void 0;
const loan_model_1 = __importDefault(require("../models/loan.model"));
const loanRepayment_model_1 = __importDefault(require("../models/loanRepayment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Create a new loan application
 * @param loanData Loan data
 * @returns Created loan
 */
const createLoan = (loanData) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user exists
    const userExists = yield user_model_1.default.findById(loanData.user);
    if (!userExists) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    // Create loan
    const loan = yield loan_model_1.default.create(Object.assign(Object.assign({}, loanData), { status: types_1.LoanStatus.PENDING }));
    return loan;
});
exports.createLoan = createLoan;
/**
 * Get all loans
 * @returns List of all loans
 */
const getAllLoans = () => __awaiter(void 0, void 0, void 0, function* () {
    const loans = yield loan_model_1.default.find()
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName')
        .sort({ applicationDate: -1 });
    return loans;
});
exports.getAllLoans = getAllLoans;
/**
 * Get loans by user ID
 * @param userId User ID
 * @returns List of user's loans
 */
const getLoansByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const loans = yield loan_model_1.default.find({ user: userId })
        .populate('approvedBy', 'firstName lastName')
        .sort({ applicationDate: -1 });
    return loans;
});
exports.getLoansByUserId = getLoansByUserId;
/**
 * Get loan by ID
 * @param loanId Loan ID
 * @returns Loan object
 */
const getLoanById = (loanId) => __awaiter(void 0, void 0, void 0, function* () {
    const loan = yield loan_model_1.default.findById(loanId)
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName');
    if (!loan) {
        throw new error_middleware_1.AppError('Loan not found', 404);
    }
    return loan;
});
exports.getLoanById = getLoanById;
/**
 * Update loan status
 * @param loanId Loan ID
 * @param status New status
 * @param adminId Admin user ID
 * @param rejectionReason Reason for rejection (if applicable)
 * @returns Updated loan
 */
const updateLoanStatus = (loanId, status, adminId, rejectionReason) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify admin exists
    const adminExists = yield user_model_1.default.findById(adminId);
    if (!adminExists) {
        throw new error_middleware_1.AppError('Admin user not found', 404);
    }
    // Find loan
    const loan = yield loan_model_1.default.findById(loanId);
    if (!loan) {
        throw new error_middleware_1.AppError('Loan not found', 404);
    }
    // Update loan status
    const updateData = {
        status,
        approvedBy: adminId,
    };
    // Add approval date if approved
    if (status === types_1.LoanStatus.APPROVED) {
        updateData.approvalDate = new Date();
    }
    // Add rejection reason if provided
    if (status === types_1.LoanStatus.REJECTED && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
    }
    // Update loan
    const updatedLoan = yield loan_model_1.default.findByIdAndUpdate(loanId, updateData, { new: true, runValidators: true })
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName');
    return updatedLoan;
});
exports.updateLoanStatus = updateLoanStatus;
/**
 * Create a loan repayment
 * @param repaymentData Loan repayment data
 * @returns Created loan repayment
 */
const createLoanRepayment = (repaymentData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Verify loan exists
    const loan = yield loan_model_1.default.findById(repaymentData.loan);
    if (!loan) {
        throw new error_middleware_1.AppError('Loan not found', 404);
    }
    // Verify user exists and matches loan user
    if (loan.user.toString() !== ((_a = repaymentData.user) === null || _a === void 0 ? void 0 : _a.toString())) {
        throw new error_middleware_1.AppError('User does not match loan owner', 400);
    }
    // Create repayment
    const repayment = yield loanRepayment_model_1.default.create(Object.assign(Object.assign({}, repaymentData), { status: types_1.PaymentStatus.PENDING }));
    return repayment;
});
exports.createLoanRepayment = createLoanRepayment;
/**
 * Get all loan repayments
 * @returns List of all loan repayments
 */
const getAllLoanRepayments = () => __awaiter(void 0, void 0, void 0, function* () {
    const repayments = yield loanRepayment_model_1.default.find()
        .populate('loan')
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName')
        .sort({ repaymentDate: -1 });
    return repayments;
});
exports.getAllLoanRepayments = getAllLoanRepayments;
/**
 * Get loan repayments by loan ID
 * @param loanId Loan ID
 * @returns List of loan's repayments
 */
const getLoanRepaymentsByLoanId = (loanId) => __awaiter(void 0, void 0, void 0, function* () {
    const repayments = yield loanRepayment_model_1.default.find({ loan: loanId })
        .populate('approvedBy', 'firstName lastName')
        .sort({ repaymentDate: -1 });
    return repayments;
});
exports.getLoanRepaymentsByLoanId = getLoanRepaymentsByLoanId;
/**
 * Get loan repayment by ID
 * @param repaymentId Loan repayment ID
 * @returns Loan repayment object
 */
const getLoanRepaymentById = (repaymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const repayment = yield loanRepayment_model_1.default.findById(repaymentId)
        .populate('loan')
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName');
    if (!repayment) {
        throw new error_middleware_1.AppError('Loan repayment not found', 404);
    }
    return repayment;
});
exports.getLoanRepaymentById = getLoanRepaymentById;
/**
 * Update loan repayment status
 * @param repaymentId Loan repayment ID
 * @param status New status
 * @param adminId Admin user ID
 * @param rejectionReason Reason for rejection (if applicable)
 * @returns Updated loan repayment
 */
const updateLoanRepaymentStatus = (repaymentId, status, adminId, rejectionReason) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify admin exists
    const adminExists = yield user_model_1.default.findById(adminId);
    if (!adminExists) {
        throw new error_middleware_1.AppError('Admin user not found', 404);
    }
    // Find repayment
    const repayment = yield loanRepayment_model_1.default.findById(repaymentId);
    if (!repayment) {
        throw new error_middleware_1.AppError('Loan repayment not found', 404);
    }
    // Update repayment status
    const updateData = {
        status,
        approvedBy: adminId,
        approvedAt: new Date(),
    };
    // Add rejection reason if provided
    if (status === types_1.PaymentStatus.REJECTED && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
    }
    // Update repayment
    const updatedRepayment = yield loanRepayment_model_1.default.findByIdAndUpdate(repaymentId, updateData, { new: true, runValidators: true })
        .populate('loan')
        .populate('user', 'firstName lastName email membershipId')
        .populate('approvedBy', 'firstName lastName');
    // If repayment is approved, check if loan is fully repaid
    if (status === types_1.PaymentStatus.APPROVED) {
        const loan = yield loan_model_1.default.findById(repayment.loan);
        if (loan) {
            // Get all approved repayments for this loan
            const approvedRepayments = yield loanRepayment_model_1.default.find({
                loan: loan._id,
                status: types_1.PaymentStatus.APPROVED,
            });
            // Calculate total repaid amount
            const totalRepaid = approvedRepayments.reduce((sum, rep) => sum + rep.amount, 0);
            // If total repaid is greater than or equal to loan amount, mark loan as paid
            if (totalRepaid >= loan.amount) {
                yield loan_model_1.default.findByIdAndUpdate(loan._id, {
                    status: types_1.LoanStatus.PAID,
                    repaymentDate: new Date(),
                });
            }
        }
    }
    return updatedRepayment;
});
exports.updateLoanRepaymentStatus = updateLoanRepaymentStatus;
/**
 * Upload loan repayment receipt
 * @param repaymentId Loan repayment ID
 * @param receiptUrl URL of uploaded receipt
 * @returns Updated loan repayment
 */
const uploadLoanRepaymentReceipt = (repaymentId, receiptUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const repayment = yield loanRepayment_model_1.default.findByIdAndUpdate(repaymentId, { receiptUrl }, { new: true, runValidators: true });
    if (!repayment) {
        throw new error_middleware_1.AppError('Loan repayment not found', 404);
    }
    return repayment;
});
exports.uploadLoanRepaymentReceipt = uploadLoanRepaymentReceipt;
