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
exports.exportToPDF = exports.exportToExcel = exports.getTransactionSummary = exports.deleteTransaction = exports.updateTransaction = exports.createTransaction = exports.getTransactionById = exports.getBalanceTransactions = exports.getExpenseTransactions = exports.getIncomeTransactions = exports.getAllTransactions = void 0;
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const types_1 = require("../types");
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
/**
 * Get all transactions
 * @route GET /api/transactions
 * @access Private (Admin only)
 */
const getAllTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Build query based on date range if provided
        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        }
        else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }
        // Get transactions with date filter
        const transactions = yield transaction_model_1.default.find(query)
            .sort({ date: -1 })
            .populate('recordedBy', 'name email')
            .populate('relatedPayment');
        // Calculate summary statistics
        const incomeTransactions = transactions.filter(t => t.type === types_1.TransactionType.INCOME);
        const expenseTransactions = transactions.filter(t => t.type === types_1.TransactionType.EXPENSE);
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netIncome = totalIncome - totalExpenses;
        (0, response_utils_1.sendSuccess)(res, 200, 'Transactions retrieved successfully', {
            transactions,
            summary: {
                totalIncome,
                totalExpenses,
                netIncome
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTransactions = getAllTransactions;
/**
 * Get income transactions
 * @route GET /api/transactions/income
 * @access Private (Admin only)
 */
const getIncomeTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Build query based on date range if provided
        const query = { type: types_1.TransactionType.INCOME };
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        }
        else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }
        const transactions = yield transaction_model_1.default.find(query)
            .sort({ date: -1 })
            .populate('recordedBy', 'name email')
            .populate('relatedPayment');
        // Calculate total income
        const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
        (0, response_utils_1.sendSuccess)(res, 200, 'Income transactions retrieved successfully', {
            transactions,
            summary: { totalIncome }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getIncomeTransactions = getIncomeTransactions;
/**
 * Get expense transactions
 * @route GET /api/transactions/expense
 * @access Private (Admin only)
 */
const getExpenseTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Build query based on date range if provided
        const query = { type: types_1.TransactionType.EXPENSE };
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        }
        else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }
        const transactions = yield transaction_model_1.default.find(query)
            .sort({ date: -1 })
            .populate('recordedBy', 'name email')
            .populate('relatedPayment');
        // Calculate total expenses
        const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
        (0, response_utils_1.sendSuccess)(res, 200, 'Expense transactions retrieved successfully', {
            transactions,
            summary: { totalExpenses }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getExpenseTransactions = getExpenseTransactions;
/**
 * Get balance transactions (both income and expense for net balance)
 * @route GET /api/transactions/balance
 * @access Private (Admin only)
 */
const getBalanceTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Build query based on date range if provided
        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        }
        else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }
        const transactions = yield transaction_model_1.default.find(query)
            .sort({ date: -1 })
            .populate('recordedBy', 'name email')
            .populate('relatedPayment');
        // Calculate summary statistics
        const incomeTransactions = transactions.filter(t => t.type === types_1.TransactionType.INCOME);
        const expenseTransactions = transactions.filter(t => t.type === types_1.TransactionType.EXPENSE);
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpenses;
        (0, response_utils_1.sendSuccess)(res, 200, 'Balance transactions retrieved successfully', {
            transactions,
            summary: {
                totalIncome,
                totalExpenses,
                netBalance
            }
        });
    }
    catch (error) {
        console.error('Error fetching balance transactions:', error);
        next(error);
    }
});
exports.getBalanceTransactions = getBalanceTransactions;
/**
 * Get transaction by ID
 * @route GET /api/transactions/:id
 * @access Private (Admin only)
 */
const getTransactionById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const transaction = yield transaction_model_1.default.findById(id)
            .populate('recordedBy', 'name email')
            .populate('relatedPayment');
        if (!transaction) {
            throw new error_middleware_1.AppError('Transaction not found', 404);
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Transaction retrieved successfully', { transaction });
    }
    catch (error) {
        next(error);
    }
});
exports.getTransactionById = getTransactionById;
/**
 * Create transaction
 * @route POST /api/transactions
 * @access Private (Admin only)
 */
const createTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transactionData = Object.assign(Object.assign({}, req.body), { recordedBy: req.user._id });
        const transaction = yield transaction_model_1.default.create(transactionData);
        (0, response_utils_1.sendSuccess)(res, 201, 'Transaction created successfully', { transaction });
    }
    catch (error) {
        next(error);
    }
});
exports.createTransaction = createTransaction;
/**
 * Update transaction
 * @route PUT /api/transactions/:id
 * @access Private (Admin only)
 */
const updateTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const transaction = yield transaction_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!transaction) {
            throw new error_middleware_1.AppError('Transaction not found', 404);
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Transaction updated successfully', { transaction });
    }
    catch (error) {
        next(error);
    }
});
exports.updateTransaction = updateTransaction;
/**
 * Delete transaction
 * @route DELETE /api/transactions/:id
 * @access Private (Admin only)
 */
const deleteTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const transaction = yield transaction_model_1.default.findByIdAndDelete(id);
        if (!transaction) {
            throw new error_middleware_1.AppError('Transaction not found', 404);
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Transaction deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTransaction = deleteTransaction;
/**
 * Get transaction summary (total income, expense, and balance)
 * @route GET /api/transactions/summary
 * @access Private (Admin only)
 */
const getTransactionSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const incomeResult = yield transaction_model_1.default.aggregate([
            { $match: { type: types_1.TransactionType.INCOME } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const expenseResult = yield transaction_model_1.default.aggregate([
            { $match: { type: types_1.TransactionType.EXPENSE } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
        const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
        const balance = totalIncome - totalExpense;
        (0, response_utils_1.sendSuccess)(res, 200, 'Transaction summary retrieved successfully', {
            summary: {
                totalIncome,
                totalExpense,
                balance
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTransactionSummary = getTransactionSummary;
/**
 * Export transactions to Excel
 * @route GET /api/transactions/export/excel
 * @access Private (Admin only)
 */
const exportToExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, startDate, endDate } = req.query;
        let query = {};
        let title = 'All Transactions';
        let dateRangeTitle = '';
        // Set type filter if provided
        if (type === 'income') {
            query.type = types_1.TransactionType.INCOME;
            title = 'Income Transactions';
        }
        else if (type === 'expense') {
            query.type = types_1.TransactionType.EXPENSE;
            title = 'Expense Transactions';
        }
        // Add date range to query if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
            const formattedStartDate = new Date(startDate).toLocaleDateString();
            const formattedEndDate = new Date(endDate).toLocaleDateString();
            dateRangeTitle = ` (${formattedStartDate} to ${formattedEndDate})`;
        }
        else if (startDate) {
            query.date = { $gte: new Date(startDate) };
            dateRangeTitle = ` (From ${new Date(startDate).toLocaleDateString()})`;
        }
        else if (endDate) {
            query.date = { $lte: new Date(endDate) };
            dateRangeTitle = ` (Until ${new Date(endDate).toLocaleDateString()})`;
        }
        // Get transactions with filters
        const transactions = yield transaction_model_1.default.find(query)
            .sort({ date: -1 })
            .populate('recordedBy', 'firstName lastName email');
        // Calculate summary statistics
        const incomeTransactions = transactions.filter(t => t.type === types_1.TransactionType.INCOME);
        const expenseTransactions = transactions.filter(t => t.type === types_1.TransactionType.EXPENSE);
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netIncome = totalIncome - totalExpenses;
        // Create a new Excel workbook
        const workbook = new exceljs_1.default.Workbook();
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
                amount: `${transaction.type === types_1.TransactionType.INCOME ? '+' : '-'} ₦${transaction.amount.toFixed(2)}`,
                recordedBy: transaction.recordedBy && typeof transaction.recordedBy === 'object' ?
                    `${transaction.recordedBy.firstName || ''} ${transaction.recordedBy.lastName || ''}`.trim() :
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
        res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.xlsx`);
        // Write to response
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        next(error);
    }
});
exports.exportToExcel = exportToExcel;
/**
 * Export transactions to PDF
 * @route GET /api/transactions/export/pdf
 * @access Private (Admin only)
 */
const exportToPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, startDate, endDate } = req.query;
        let query = {};
        let title = 'All Transactions';
        let dateRangeTitle = '';
        // Set type filter if provided
        if (type === 'income') {
            query.type = types_1.TransactionType.INCOME;
            title = 'Income Transactions';
        }
        else if (type === 'expense') {
            query.type = types_1.TransactionType.EXPENSE;
            title = 'Expense Transactions';
        }
        // Add date range to query if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
            const formattedStartDate = new Date(startDate).toLocaleDateString();
            const formattedEndDate = new Date(endDate).toLocaleDateString();
            dateRangeTitle = ` (${formattedStartDate} to ${formattedEndDate})`;
        }
        else if (startDate) {
            query.date = { $gte: new Date(startDate) };
            dateRangeTitle = ` (From ${new Date(startDate).toLocaleDateString()})`;
        }
        else if (endDate) {
            query.date = { $lte: new Date(endDate) };
            dateRangeTitle = ` (Until ${new Date(endDate).toLocaleDateString()})`;
        }
        // Get transactions with filters
        const transactions = yield transaction_model_1.default.find(query)
            .sort({ date: -1 })
            .populate('recordedBy', 'firstName lastName email');
        // Calculate summary statistics
        const incomeTransactions = transactions.filter(t => t.type === types_1.TransactionType.INCOME);
        const expenseTransactions = transactions.filter(t => t.type === types_1.TransactionType.EXPENSE);
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const netIncome = totalIncome - totalExpenses;
        // Create a PDF document
        const doc = new pdfkit_1.default({ margin: 50 });
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=transactions-${new Date().toISOString().split('T')[0]}.pdf`);
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
            doc.text(`${transaction.type === types_1.TransactionType.INCOME ? '+' : '-'} ₦${transaction.amount.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowTop);
            // Move to next row
            rowTop += 20;
        });
        // Add summary section if there's enough space, otherwise add a new page
        if (rowTop > 650) {
            doc.addPage();
            rowTop = 50;
        }
        else {
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
    }
    catch (error) {
        next(error);
    }
});
exports.exportToPDF = exportToPDF;
