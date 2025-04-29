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
exports.getLoansByUserId = exports.getLoanHistory = exports.getActiveLoans = exports.getMyLoans = exports.rejectLoan = exports.approveLoan = exports.createLoan = exports.getLoanById = exports.getLoansByStatus = exports.getAllLoans = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const loan_model_1 = __importDefault(require("../models/loan.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const types_1 = require("../types");
/**
 * Get all loans with summary statistics
 * @route GET /api/loans
 * @access Private (Admin only)
 */
const getAllLoans = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loans = yield loan_model_1.default.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });
        // Calculate summary statistics
        const totalActiveLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.APPROVED });
        const pendingApplications = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.PENDING });
        const approvedLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.APPROVED });
        const rejectedLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.REJECTED });
        const defaultedLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.DEFAULTED });
        // Calculate repayment rate (percentage of loans that are not defaulted)
        const totalCompletedLoans = yield loan_model_1.default.countDocuments({
            status: { $in: [types_1.LoanStatus.APPROVED, types_1.LoanStatus.PAID, types_1.LoanStatus.DEFAULTED] }
        });
        const paidLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.PAID });
        const repaymentRate = totalCompletedLoans > 0
            ? Math.round((paidLoans / totalCompletedLoans) * 100)
            : 100;
        (0, response_utils_1.sendSuccess)(res, 200, 'Loans retrieved successfully', {
            loans,
            totalActiveLoans,
            pendingApplications,
            repaymentRate,
            approvedLoans,
            rejectedLoans,
            defaultedLoans
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllLoans = getAllLoans;
/**
 * Get loans by status
 * @route GET /api/loans/:status
 * @access Private (Admin only)
 */
const getLoansByStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.params;
        if (!Object.values(types_1.LoanStatus).includes(status)) {
            throw new error_middleware_1.AppError('Invalid loan status', 400);
        }
        const loans = yield loan_model_1.default.find({ status })
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });
        // Calculate summary statistics (same as getAllLoans)
        const totalActiveLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.APPROVED });
        const pendingApplications = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.PENDING });
        const approvedLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.APPROVED });
        const rejectedLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.REJECTED });
        const defaultedLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.DEFAULTED });
        const totalCompletedLoans = yield loan_model_1.default.countDocuments({
            status: { $in: [types_1.LoanStatus.APPROVED, types_1.LoanStatus.PAID, types_1.LoanStatus.DEFAULTED] }
        });
        const paidLoans = yield loan_model_1.default.countDocuments({ status: types_1.LoanStatus.PAID });
        const repaymentRate = totalCompletedLoans > 0
            ? Math.round((paidLoans / totalCompletedLoans) * 100)
            : 100;
        (0, response_utils_1.sendSuccess)(res, 200, `${status} loans retrieved successfully`, {
            loans,
            totalActiveLoans,
            pendingApplications,
            repaymentRate,
            approvedLoans,
            rejectedLoans,
            defaultedLoans
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getLoansByStatus = getLoansByStatus;
/**
 * Get loan by ID
 * @route GET /api/loans/:id
 * @access Private (Admin or loan owner)
 */
const getLoanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new error_middleware_1.AppError('Invalid loan ID', 400);
        }
        // Find and populate the loan document
        const loan = yield loan_model_1.default.findById(id)
            .populate('user', 'firstName lastName email');
        if (!loan) {
            throw new error_middleware_1.AppError('Loan not found', 404);
        }
        // Cast to our custom type for proper type checking
        const populatedLoan = loan;
        // Check if user is the loan owner or has an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role)) {
            // Extract the user ID for comparison regardless of whether it's populated or not
            let userId;
            if (!populatedLoan.user) {
                throw new error_middleware_1.AppError('Loan user information is missing', 500);
            }
            if (typeof populatedLoan.user === 'string') {
                userId = populatedLoan.user;
            }
            else if (populatedLoan.user instanceof mongoose_1.default.Types.ObjectId) {
                userId = populatedLoan.user.toString();
            }
            else if (populatedLoan.user._id) {
                // It's a populated user document
                userId = populatedLoan.user._id.toString();
            }
            else {
                throw new error_middleware_1.AppError('Invalid user reference in loan', 500);
            }
            if (userId !== req.user._id.toString()) {
                throw new error_middleware_1.AppError('Not authorized to access this loan', 403);
            }
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Loan retrieved successfully', { loan });
    }
    catch (error) {
        next(error);
    }
});
exports.getLoanById = getLoanById;
/**
 * Create a new loan application
 * @route POST /api/loans
 * @access Private
 */
const createLoan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, purpose, durationInMonths, interestRate } = req.body;
        // Validate required fields
        if (!amount || !purpose || !durationInMonths) {
            throw new error_middleware_1.AppError('Please provide amount, purpose, and duration', 400);
        }
        // Create new loan with pending status
        const loanData = {
            user: req.user._id,
            amount,
            purpose,
            durationInMonths,
            interestRate: interestRate || 5, // Default interest rate if not provided
            status: types_1.LoanStatus.PENDING,
            applicationDate: new Date()
        };
        const loan = yield loan_model_1.default.create(loanData);
        // Populate user information
        const populatedLoan = yield loan_model_1.default.findById(loan._id)
            .populate('user', 'firstName lastName email');
        (0, response_utils_1.sendSuccess)(res, 201, 'Loan application submitted successfully', { loan: populatedLoan });
    }
    catch (error) {
        next(error);
    }
});
exports.createLoan = createLoan;
/**
 * Approve a loan
 * @route PUT /api/loans/:id/approve
 * @access Private (Admin only)
 */
const approveLoan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new error_middleware_1.AppError('Invalid loan ID', 400);
        }
        const loan = yield loan_model_1.default.findById(id);
        if (!loan) {
            throw new error_middleware_1.AppError('Loan not found', 404);
        }
        if (loan.status !== types_1.LoanStatus.PENDING) {
            throw new error_middleware_1.AppError(`Loan cannot be approved because it is already ${loan.status}`, 400);
        }
        // Update loan status
        loan.status = types_1.LoanStatus.APPROVED;
        loan.approvedBy = req.user._id;
        loan.approvalDate = new Date();
        yield loan.save();
        // Populate user information
        const updatedLoan = yield loan_model_1.default.findById(id)
            .populate('user', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');
        (0, response_utils_1.sendSuccess)(res, 200, 'Loan approved successfully', { loan: updatedLoan });
    }
    catch (error) {
        next(error);
    }
});
exports.approveLoan = approveLoan;
/**
 * Reject a loan
 * @route PUT /api/loans/:id/reject
 * @access Private (Admin only)
 */
const rejectLoan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new error_middleware_1.AppError('Invalid loan ID', 400);
        }
        if (!rejectionReason) {
            throw new error_middleware_1.AppError('Rejection reason is required', 400);
        }
        const loan = yield loan_model_1.default.findById(id);
        if (!loan) {
            throw new error_middleware_1.AppError('Loan not found', 404);
        }
        if (loan.status !== types_1.LoanStatus.PENDING) {
            throw new error_middleware_1.AppError(`Loan cannot be rejected because it is already ${loan.status}`, 400);
        }
        // Update loan status
        loan.status = types_1.LoanStatus.REJECTED;
        loan.rejectionReason = rejectionReason;
        loan.approvedBy = req.user._id; // Using the same field to track who rejected it
        loan.approvalDate = new Date(); // Using the same field to track rejection date
        yield loan.save();
        // Populate user information
        const updatedLoan = yield loan_model_1.default.findById(id)
            .populate('user', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');
        (0, response_utils_1.sendSuccess)(res, 200, 'Loan rejected successfully', { loan: updatedLoan });
    }
    catch (error) {
        next(error);
    }
});
exports.rejectLoan = rejectLoan;
/**
 * Get current user's loans
 * @route GET /api/loans/my-loans
 * @access Private
 */
const getMyLoans = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loans = yield loan_model_1.default.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'Your loans retrieved successfully', { loans });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyLoans = getMyLoans;
/**
 * Get active loans for the current user
 * @route GET /api/loans/active
 * @access Private
 */
const getActiveLoans = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loans = yield loan_model_1.default.find({
            user: req.user._id,
            status: { $in: [types_1.LoanStatus.PENDING, types_1.LoanStatus.APPROVED] }
        }).sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'Active loans retrieved successfully', { loans });
    }
    catch (error) {
        next(error);
    }
});
exports.getActiveLoans = getActiveLoans;
/**
 * Get loan history for the current user
 * @route GET /api/loans/history
 * @access Private
 */
const getLoanHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const loans = yield loan_model_1.default.find({
            user: req.user._id,
            status: { $in: [types_1.LoanStatus.PAID, types_1.LoanStatus.REJECTED, types_1.LoanStatus.DEFAULTED] }
        })
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'Loan history retrieved successfully', { loans });
    }
    catch (error) {
        next(error);
    }
});
exports.getLoanHistory = getLoanHistory;
/**
 * Get loans by user ID
 * @route GET /api/loans/member/:userId
 * @access Private (Admin only)
 */
const getLoansByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user has an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role)) {
            throw new error_middleware_1.AppError('Not authorized to access these loans', 403);
        }
        // Validate that the user exists
        const userExists = yield user_model_1.default.exists({ _id: userId });
        if (!userExists) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        // Get all loans for the specified user
        const loans = yield loan_model_1.default.find({ user: userId })
            .populate('user', 'firstName lastName email membershipId')
            .sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'User loans retrieved successfully', { loans });
    }
    catch (error) {
        console.error('Error fetching loans by user ID:', error);
        next(error);
    }
});
exports.getLoansByUserId = getLoansByUserId;
