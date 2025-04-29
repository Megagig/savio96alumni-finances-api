import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/transaction.model';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import { TransactionType } from '../types';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

/**
 * Get all transactions
 * @route GET /api/transactions
 * @access Private (Admin only)
 */
export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build query based on date range if provided
    const query: any = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }
    
    // Get transactions with date filter
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('recordedBy', 'name email')
      .populate('relatedPayment');
    
    // Calculate summary statistics
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    
    sendSuccess(res, 200, 'Transactions retrieved successfully', { 
      transactions,
      summary: {
        totalIncome,
        totalExpenses,
        netIncome
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get income transactions
 * @route GET /api/transactions/income
 * @access Private (Admin only)
 */
export const getIncomeTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build query based on date range if provided
    const query: any = { type: TransactionType.INCOME };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('recordedBy', 'name email')
      .populate('relatedPayment');
    
    // Calculate total income
    const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    sendSuccess(res, 200, 'Income transactions retrieved successfully', { 
      transactions, 
      summary: { totalIncome } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense transactions
 * @route GET /api/transactions/expense
 * @access Private (Admin only)
 */
export const getExpenseTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build query based on date range if provided
    const query: any = { type: TransactionType.EXPENSE };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('recordedBy', 'name email')
      .populate('relatedPayment');
    
    // Calculate total expenses
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    sendSuccess(res, 200, 'Expense transactions retrieved successfully', { 
      transactions, 
      summary: { totalExpenses } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get balance transactions (both income and expense for net balance)
 * @route GET /api/transactions/balance
 * @access Private (Admin only)
 */
export const getBalanceTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build query based on date range if provided
    const query: any = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }
    
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('recordedBy', 'name email')
      .populate('relatedPayment');
    
    // Calculate summary statistics
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;
    
    sendSuccess(res, 200, 'Balance transactions retrieved successfully', { 
      transactions, 
      summary: {
        totalIncome,
        totalExpenses,
        netBalance
      }
    });
  } catch (error) {
    console.error('Error fetching balance transactions:', error);
    next(error);
  }
};

/**
 * Get transaction by ID
 * @route GET /api/transactions/:id
 * @access Private (Admin only)
 */
export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id)
      .populate('recordedBy', 'name email')
      .populate('relatedPayment');
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    
    sendSuccess(res, 200, 'Transaction retrieved successfully', { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Create transaction
 * @route POST /api/transactions
 * @access Private (Admin only)
 */
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionData = {
      ...req.body,
      recordedBy: req.user._id
    };
    
    const transaction = await Transaction.create(transactionData);
    
    sendSuccess(res, 201, 'Transaction created successfully', { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Update transaction
 * @route PUT /api/transactions/:id
 * @access Private (Admin only)
 */
export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    
    sendSuccess(res, 200, 'Transaction updated successfully', { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete transaction
 * @route DELETE /api/transactions/:id
 * @access Private (Admin only)
 */
export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    
    sendSuccess(res, 200, 'Transaction deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get transaction summary (total income, expense, and balance)
 * @route GET /api/transactions/summary
 * @access Private (Admin only)
 */
export const getTransactionSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const incomeResult = await Transaction.aggregate([
      { $match: { type: TransactionType.INCOME } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const expenseResult = await Transaction.aggregate([
      { $match: { type: TransactionType.EXPENSE } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
    const balance = totalIncome - totalExpense;
    
    sendSuccess(res, 200, 'Transaction summary retrieved successfully', {
      summary: {
        totalIncome,
        totalExpense,
        balance
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export transactions to Excel
 * @route GET /api/transactions/export/excel
 * @access Private (Admin only)
 */
export const exportToExcel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, startDate, endDate } = req.query;
    let query: any = {};
    let title = 'All Transactions';
    let dateRangeTitle = '';
    
    // Set type filter if provided
    if (type === 'income') {
      query.type = TransactionType.INCOME;
      title = 'Income Transactions';
    } else if (type === 'expense') {
      query.type = TransactionType.EXPENSE;
      title = 'Expense Transactions';
    }
    
    // Add date range to query if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
      const formattedStartDate = new Date(startDate as string).toLocaleDateString();
      const formattedEndDate = new Date(endDate as string).toLocaleDateString();
      dateRangeTitle = ` (${formattedStartDate} to ${formattedEndDate})`;
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
      dateRangeTitle = ` (From ${new Date(startDate as string).toLocaleDateString()})`;
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
      dateRangeTitle = ` (Until ${new Date(endDate as string).toLocaleDateString()})`;
    }
    
    // Get transactions with filters
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('recordedBy', 'firstName lastName email');
    
    // Calculate summary statistics
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title + dateRangeTitle);
    
    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Title/Description', key: 'title', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Recorded By', key: 'recordedBy', width: 20 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };
    
    // Add data rows
    transactions.forEach(transaction => {
      worksheet.addRow({
        date: new Date(transaction.date).toLocaleDateString(),
        title: transaction.title,
        category: transaction.category,
        type: transaction.type,
        amount: `${transaction.type === TransactionType.INCOME ? '+' : '-'} ₦${transaction.amount.toFixed(2)}`,
        recordedBy: transaction.recordedBy && typeof transaction.recordedBy === 'object' ? 
          `${(transaction.recordedBy as any).firstName || ''} ${(transaction.recordedBy as any).lastName || ''}`.trim() : 
          'N/A'
      });
    });
    
    // Add summary section
    worksheet.addRow([]);
    worksheet.addRow(['Summary']);
    worksheet.getRow(worksheet.rowCount).font = { bold: true };
    
    worksheet.addRow(['Total Income', '', '', '', `₦${totalIncome.toFixed(2)}`]);
    worksheet.addRow(['Total Expenses', '', '', '', `₦${totalExpenses.toFixed(2)}`]);
    worksheet.addRow(['Net Income', '', '', '', `₦${netIncome.toFixed(2)}`]);
    
    // Style summary rows
    const summaryStartRow = worksheet.rowCount - 2;
    worksheet.getCell(`E${summaryStartRow}`).font = { color: { argb: '00008000' } }; // Green for income
    worksheet.getCell(`E${summaryStartRow + 1}`).font = { color: { argb: '00FF0000' } }; // Red for expenses
    worksheet.getCell(`E${summaryStartRow + 2}`).font = { bold: true };
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * Export transactions to PDF
 * @route GET /api/transactions/export/pdf
 * @access Private (Admin only)
 */
export const exportToPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, startDate, endDate } = req.query;
    let query: any = {};
    let title = 'All Transactions';
    let dateRangeTitle = '';
    
    // Set type filter if provided
    if (type === 'income') {
      query.type = TransactionType.INCOME;
      title = 'Income Transactions';
    } else if (type === 'expense') {
      query.type = TransactionType.EXPENSE;
      title = 'Expense Transactions';
    }
    
    // Add date range to query if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
      const formattedStartDate = new Date(startDate as string).toLocaleDateString();
      const formattedEndDate = new Date(endDate as string).toLocaleDateString();
      dateRangeTitle = ` (${formattedStartDate} to ${formattedEndDate})`;
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
      dateRangeTitle = ` (From ${new Date(startDate as string).toLocaleDateString()})`;
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
      dateRangeTitle = ` (Until ${new Date(endDate as string).toLocaleDateString()})`;
    }
    
    // Get transactions with filters
    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('recordedBy', 'firstName lastName email');
    
    // Calculate summary statistics
    const incomeTransactions = transactions.filter(t => t.type === TransactionType.INCOME);
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    
    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.pdf`
    );
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text(title + dateRangeTitle, { align: 'center' });
    doc.moveDown();
    
    // Add date
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);
    
    // Add table headers
    const tableTop = 150;
    const tableLeft = 50;
    const colWidths = [80, 150, 80, 80, 80];
    
    doc.fontSize(10).text('Date', tableLeft, tableTop);
    doc.text('Title/Description', tableLeft + colWidths[0], tableTop);
    doc.text('Category', tableLeft + colWidths[0] + colWidths[1], tableTop);
    doc.text('Type', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
    doc.text('Amount', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
    
    // Draw a line
    doc.moveTo(tableLeft, tableTop + 15)
      .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop + 15)
      .stroke();
    
    // Add table rows
    let rowTop = tableTop + 25;
    
    transactions.forEach((transaction, index) => {
      // Check if we need a new page
      if (rowTop > 700) {
        doc.addPage();
        rowTop = 50;
        
        // Add headers to new page
        doc.fontSize(10).text('Date', tableLeft, rowTop);
        doc.text('Title/Description', tableLeft + colWidths[0], rowTop);
        doc.text('Category', tableLeft + colWidths[0] + colWidths[1], rowTop);
        doc.text('Type', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);
        doc.text('Amount', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowTop);
        
        // Draw a line
        doc.moveTo(tableLeft, rowTop + 15)
          .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], rowTop + 15)
          .stroke();
        
        rowTop += 25;
      }
      
      // Format date
      const date = new Date(transaction.date).toLocaleDateString();
      
      // Add row data
      doc.fontSize(8).text(date, tableLeft, rowTop);
      doc.text(transaction.title, tableLeft + colWidths[0], rowTop);
      doc.text(transaction.category, tableLeft + colWidths[0] + colWidths[1], rowTop);
      doc.text(transaction.type, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);
      doc.text(
        `${transaction.type === TransactionType.INCOME ? '+' : '-'} ₦${transaction.amount.toFixed(2)}`,
        tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        rowTop
      );
      
      // Move to next row
      rowTop += 20;
    });
    
    // Add summary section if there's enough space, otherwise add a new page
    if (rowTop > 650) {
      doc.addPage();
      rowTop = 50;
    } else {
      rowTop += 30;
    }
    
    // Add summary title
    doc.fontSize(12).text('Summary', { underline: true });
    rowTop += 20;
    
    // Add summary data
    doc.fontSize(10).text(`Total Income: ₦${totalIncome.toFixed(2)}`, tableLeft, rowTop);
    rowTop += 15;
    doc.text(`Total Expenses: ₦${totalExpenses.toFixed(2)}`, tableLeft, rowTop);
    rowTop += 15;
    doc.text(`Net Income: ₦${netIncome.toFixed(2)}`, tableLeft, rowTop);
    
    // Finalize the PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};
