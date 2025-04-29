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
exports.getFinancialSummary = exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactionsByDateRange = exports.getTransactionsByCategory = exports.getTransactionsByType = exports.getAllTransactions = exports.createTransaction = void 0;
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Create a new transaction
 * @param transactionData Transaction data
 * @returns Created transaction
 */
const createTransaction = (transactionData) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify recorder exists
    const recorderExists = yield user_model_1.default.findById(transactionData.recordedBy);
    if (!recorderExists) {
        throw new error_middleware_1.AppError('Recorder not found', 404);
    }
    // Create transaction
    const transaction = yield transaction_model_1.default.create(transactionData);
    return transaction;
});
exports.createTransaction = createTransaction;
/**
 * Get all transactions
 * @returns List of all transactions
 */
const getAllTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.default.find()
        .populate('recordedBy', 'firstName lastName')
        .populate('relatedPayment')
        .sort({ date: -1 });
    return transactions;
});
exports.getAllTransactions = getAllTransactions;
/**
 * Get transactions by type
 * @param type Transaction type (income or expense)
 * @returns List of transactions of specified type
 */
const getTransactionsByType = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.default.find({ type })
        .populate('recordedBy', 'firstName lastName')
        .populate('relatedPayment')
        .sort({ date: -1 });
    return transactions;
});
exports.getTransactionsByType = getTransactionsByType;
/**
 * Get transactions by category
 * @param category Transaction category
 * @returns List of transactions of specified category
 */
const getTransactionsByCategory = (category) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.default.find({ category })
        .populate('recordedBy', 'firstName lastName')
        .populate('relatedPayment')
        .sort({ date: -1 });
    return transactions;
});
exports.getTransactionsByCategory = getTransactionsByCategory;
/**
 * Get transactions by date range
 * @param startDate Start date
 * @param endDate End date
 * @returns List of transactions within date range
 */
const getTransactionsByDateRange = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.default.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    })
        .populate('recordedBy', 'firstName lastName')
        .populate('relatedPayment')
        .sort({ date: -1 });
    return transactions;
});
exports.getTransactionsByDateRange = getTransactionsByDateRange;
/**
 * Get transaction by ID
 * @param transactionId Transaction ID
 * @returns Transaction object
 */
const getTransactionById = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transaction_model_1.default.findById(transactionId)
        .populate('recordedBy', 'firstName lastName')
        .populate('relatedPayment');
    if (!transaction) {
        throw new error_middleware_1.AppError('Transaction not found', 404);
    }
    return transaction;
});
exports.getTransactionById = getTransactionById;
/**
 * Update transaction
 * @param transactionId Transaction ID
 * @param updateData Updated transaction data
 * @returns Updated transaction
 */
const updateTransaction = (transactionId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transaction_model_1.default.findByIdAndUpdate(transactionId, updateData, { new: true, runValidators: true })
        .populate('recordedBy', 'firstName lastName')
        .populate('relatedPayment');
    if (!transaction) {
        throw new error_middleware_1.AppError('Transaction not found', 404);
    }
    return transaction;
});
exports.updateTransaction = updateTransaction;
/**
 * Delete transaction
 * @param transactionId Transaction ID
 * @returns Success message
 */
const deleteTransaction = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transaction_model_1.default.findById(transactionId);
    if (!transaction) {
        throw new error_middleware_1.AppError('Transaction not found', 404);
    }
    yield transaction_model_1.default.findByIdAndDelete(transactionId);
    return { message: 'Transaction deleted successfully' };
});
exports.deleteTransaction = deleteTransaction;
/**
 * Get financial summary
 * @param startDate Start date
 * @param endDate End date
 * @returns Financial summary
 */
const getFinancialSummary = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all transactions within date range
    const transactions = yield transaction_model_1.default.find({
        date: {
            $gte: startDate,
            $lte: endDate,
        },
    });
    // Calculate total income
    const totalIncome = transactions
        .filter(t => t.type === types_1.TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
    // Calculate total expenses
    const totalExpenses = transactions
        .filter(t => t.type === types_1.TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
    // Calculate net balance
    const netBalance = totalIncome - totalExpenses;
    // Get income by category
    const incomeByCategory = yield transaction_model_1.default.aggregate([
        {
            $match: {
                type: types_1.TransactionType.INCOME,
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
            },
        },
        {
            $sort: { total: -1 },
        },
    ]);
    // Get expenses by category
    const expensesByCategory = yield transaction_model_1.default.aggregate([
        {
            $match: {
                type: types_1.TransactionType.EXPENSE,
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
            },
        },
        {
            $sort: { total: -1 },
        },
    ]);
    return {
        totalIncome,
        totalExpenses,
        netBalance,
        incomeByCategory,
        expensesByCategory,
    };
});
exports.getFinancialSummary = getFinancialSummary;
