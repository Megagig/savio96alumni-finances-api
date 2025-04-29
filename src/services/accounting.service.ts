import Transaction from '../models/transaction.model';
import User from '../models/user.model';
import { ITransaction, TransactionType } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new transaction
 * @param transactionData Transaction data
 * @returns Created transaction
 */
export const createTransaction = async (transactionData: Partial<ITransaction>) => {
  // Verify recorder exists
  const recorderExists = await User.findById(transactionData.recordedBy);
  if (!recorderExists) {
    throw new AppError('Recorder not found', 404);
  }

  // Create transaction
  const transaction = await Transaction.create(transactionData);
  return transaction;
};

/**
 * Get all transactions
 * @returns List of all transactions
 */
export const getAllTransactions = async () => {
  const transactions = await Transaction.find()
    .populate('recordedBy', 'firstName lastName')
    .populate('relatedPayment')
    .sort({ date: -1 });
  return transactions;
};

/**
 * Get transactions by type
 * @param type Transaction type (income or expense)
 * @returns List of transactions of specified type
 */
export const getTransactionsByType = async (type: TransactionType) => {
  const transactions = await Transaction.find({ type })
    .populate('recordedBy', 'firstName lastName')
    .populate('relatedPayment')
    .sort({ date: -1 });
  return transactions;
};

/**
 * Get transactions by category
 * @param category Transaction category
 * @returns List of transactions of specified category
 */
export const getTransactionsByCategory = async (category: string) => {
  const transactions = await Transaction.find({ category })
    .populate('recordedBy', 'firstName lastName')
    .populate('relatedPayment')
    .sort({ date: -1 });
  return transactions;
};

/**
 * Get transactions by date range
 * @param startDate Start date
 * @param endDate End date
 * @returns List of transactions within date range
 */
export const getTransactionsByDateRange = async (startDate: Date, endDate: Date) => {
  const transactions = await Transaction.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate('recordedBy', 'firstName lastName')
    .populate('relatedPayment')
    .sort({ date: -1 });
  return transactions;
};

/**
 * Get transaction by ID
 * @param transactionId Transaction ID
 * @returns Transaction object
 */
export const getTransactionById = async (transactionId: string) => {
  const transaction = await Transaction.findById(transactionId)
    .populate('recordedBy', 'firstName lastName')
    .populate('relatedPayment');
  
  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  return transaction;
};

/**
 * Update transaction
 * @param transactionId Transaction ID
 * @param updateData Updated transaction data
 * @returns Updated transaction
 */
export const updateTransaction = async (
  transactionId: string,
  updateData: Partial<ITransaction>
) => {
  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('recordedBy', 'firstName lastName')
    .populate('relatedPayment');

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  return transaction;
};

/**
 * Delete transaction
 * @param transactionId Transaction ID
 * @returns Success message
 */
export const deleteTransaction = async (transactionId: string) => {
  const transaction = await Transaction.findById(transactionId);
  
  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  await Transaction.findByIdAndDelete(transactionId);

  return { message: 'Transaction deleted successfully' };
};

/**
 * Get financial summary
 * @param startDate Start date
 * @param endDate End date
 * @returns Financial summary
 */
export const getFinancialSummary = async (startDate: Date, endDate: Date) => {
  // Get all transactions within date range
  const transactions = await Transaction.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  // Calculate total income
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total expenses
  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate net balance
  const netBalance = totalIncome - totalExpenses;

  // Get income by category
  const incomeByCategory = await Transaction.aggregate([
    {
      $match: {
        type: TransactionType.INCOME,
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
  const expensesByCategory = await Transaction.aggregate([
    {
      $match: {
        type: TransactionType.EXPENSE,
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
};
