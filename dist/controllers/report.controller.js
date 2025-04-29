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
exports.generateDuesReportExcel = exports.generateDuesReportPDF = exports.generateLoansReportExcel = exports.generateLoansReportPDF = exports.generatePaymentsReportExcel = exports.generatePaymentsReportPDF = exports.generateMembersReportExcel = exports.generateMembersReportPDF = exports.generateFinancialReportExcel = exports.generateFinancialReportPDF = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const payment_model_1 = __importDefault(require("../models/payment.model"));
const transaction_model_1 = __importDefault(require("../models/transaction.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const due_model_1 = __importDefault(require("../models/due.model"));
const levy_model_1 = __importDefault(require("../models/levy.model"));
const pledge_model_1 = __importDefault(require("../models/pledge.model"));
const donation_model_1 = __importDefault(require("../models/donation.model"));
const loan_model_1 = __importDefault(require("../models/loan.model"));
const types_1 = require("../types");
const pdfkit_1 = __importDefault(require("pdfkit"));
const exceljs_1 = __importDefault(require("exceljs"));
/**
 * Generate financial report in PDF format
 * @route GET /api/reports/financial/pdf
 * @access Private (Admin only)
 */
const generateFinancialReportPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a variable to track if headers have been sent
    let headersSent = false;
    try {
        const { startDate, endDate } = req.query;
        // Parse date filters if provided
        const dateFilter = {};
        if (startDate) {
            dateFilter.createdAt = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.createdAt)
                dateFilter.createdAt = {};
            dateFilter.createdAt.$lte = new Date(endDate);
        }
        // Fetch data for report
        const [payments, transactions, users, dues, levies, pledges, donations, loans] = yield Promise.all([
            payment_model_1.default.find(Object.assign(Object.assign({}, dateFilter), { status: types_1.PaymentStatus.APPROVED })).populate('user', 'firstName lastName email'),
            transaction_model_1.default.find(dateFilter).sort({ date: -1 }),
            user_model_1.default.countDocuments({ role: 'member', isActive: true }),
            due_model_1.default.countDocuments(),
            levy_model_1.default.countDocuments(),
            pledge_model_1.default.countDocuments(),
            donation_model_1.default.countDocuments(),
            loan_model_1.default.countDocuments()
        ]);
        // Calculate summary statistics
        const totalIncome = transactions
            .filter(t => t.type === types_1.TransactionType.INCOME || t.type === types_1.TransactionType.CREDIT)
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === types_1.TransactionType.EXPENSE || t.type === types_1.TransactionType.DEBIT)
            .reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpenses;
        // Group transactions by category
        const incomeByCategory = transactions
            .filter(t => t.type === types_1.TransactionType.INCOME || t.type === types_1.TransactionType.CREDIT)
            .reduce((acc, t) => {
            const category = t.category || 'Uncategorized';
            if (!acc[category])
                acc[category] = 0;
            acc[category] += t.amount;
            return acc;
        }, {});
        const expensesByCategory = transactions
            .filter(t => t.type === types_1.TransactionType.EXPENSE || t.type === types_1.TransactionType.DEBIT)
            .reduce((acc, t) => {
            const category = t.category || 'Uncategorized';
            if (!acc[category])
                acc[category] = 0;
            acc[category] += t.amount;
            return acc;
        }, {});
        // Create PDF document
        const doc = new pdfkit_1.default({ margin: 50 });
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
        headersSent = true;
        // Pipe PDF to response
        doc.pipe(res);
        // Add content to PDF
        doc
            .fontSize(25)
            .text('Financial Hub - Financial Report', { align: 'center' })
            .moveDown();
        // Add report period
        doc
            .fontSize(12)
            .text(`Report Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'All time'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' })
            .moveDown(2);
        // Add summary section
        doc
            .fontSize(16)
            .text('Financial Summary', { underline: true })
            .moveDown();
        doc
            .fontSize(12)
            .text(`Total Income: ₦${totalIncome.toLocaleString()}`)
            .text(`Total Expenses: ₦${totalExpenses.toLocaleString()}`)
            .text(`Net Balance: ₦${netBalance.toLocaleString()}`)
            .moveDown(2);
        // Add organization statistics
        doc
            .fontSize(16)
            .text('Organization Statistics', { underline: true })
            .moveDown();
        doc
            .fontSize(12)
            .text(`Active Members: ${users}`)
            .text(`Total Dues: ${dues}`)
            .text(`Total Levies: ${levies}`)
            .text(`Total Pledges: ${pledges}`)
            .text(`Total Donations: ${donations}`)
            .text(`Total Loans: ${loans}`)
            .moveDown(2);
        // Add income by category
        doc
            .fontSize(16)
            .text('Income by Category', { underline: true })
            .moveDown();
        Object.entries(incomeByCategory).forEach(([category, amount]) => {
            doc.fontSize(12).text(`${category}: ₦${amount.toLocaleString()}`);
        });
        doc.moveDown(2);
        // Add expenses by category
        doc
            .fontSize(16)
            .text('Expenses by Category', { underline: true })
            .moveDown();
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            doc.fontSize(12).text(`${category}: ₦${amount.toLocaleString()}`);
        });
        doc.moveDown(2);
        // Add recent transactions
        doc
            .fontSize(16)
            .text('Recent Transactions', { underline: true })
            .moveDown();
        // Create a table for transactions
        const recentTransactions = transactions.slice(0, 10);
        if (recentTransactions.length > 0) {
            // Table headers
            const tableTop = doc.y;
            const tableHeaders = ['Date', 'Description', 'Type', 'Amount'];
            const columnWidths = [100, 200, 80, 100];
            let y = tableTop;
            // Draw headers
            doc.fontSize(10).font('Helvetica-Bold');
            tableHeaders.forEach((header, i) => {
                doc.text(header, doc.x + (i > 0 ? columnWidths.slice(0, i).reduce((a, b) => a + b, 0) : 0), y);
            });
            y += 20;
            // Draw rows
            doc.fontSize(10).font('Helvetica');
            recentTransactions.forEach((transaction) => {
                doc.text(new Date(transaction.date).toLocaleDateString(), doc.x, y);
                doc.text(transaction.description || '', doc.x + columnWidths[0], y, { width: columnWidths[1] });
                doc.text(transaction.type, doc.x + columnWidths[0] + columnWidths[1], y);
                doc.text(`₦${transaction.amount.toLocaleString()}`, doc.x + columnWidths[0] + columnWidths[1] + columnWidths[2], y);
                y += 20;
            });
        }
        else {
            doc.text('No recent transactions found.');
        }
        // Finalize PDF
        doc.end();
    }
    catch (error) {
        console.error('Error generating financial report PDF:', error);
        // Only send error response if headers haven't been sent yet
        if (!headersSent) {
            if (error instanceof error_middleware_1.AppError) {
                return next(error);
            }
            return next(new error_middleware_1.AppError('Failed to generate financial report PDF', 500));
        }
        // If headers were sent but the PDF stream failed, we need to end the response
        try {
            res.end();
        }
        catch (endError) {
            console.error('Error ending response after PDF generation failure:', endError);
        }
    }
});
exports.generateFinancialReportPDF = generateFinancialReportPDF;
/**
 * Generate financial report in Excel format
 * @route GET /api/reports/financial/excel
 * @access Private (Admin only)
 */
const generateFinancialReportExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.query;
        // Parse date filters if provided
        const dateFilter = {};
        if (startDate) {
            dateFilter.createdAt = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.createdAt)
                dateFilter.createdAt = {};
            dateFilter.createdAt.$lte = new Date(endDate);
        }
        // Fetch data for report
        const [payments, transactions, users, dues, levies, pledges, donations, loans] = yield Promise.all([
            payment_model_1.default.find(Object.assign(Object.assign({}, dateFilter), { status: types_1.PaymentStatus.APPROVED })).populate('user', 'firstName lastName email'),
            transaction_model_1.default.find(dateFilter).sort({ date: -1 }),
            user_model_1.default.countDocuments({ role: 'member', isActive: true }),
            due_model_1.default.countDocuments(),
            levy_model_1.default.countDocuments(),
            pledge_model_1.default.countDocuments(),
            donation_model_1.default.countDocuments(),
            loan_model_1.default.countDocuments()
        ]);
        // Calculate summary statistics
        const totalIncome = transactions
            .filter(t => t.type === types_1.TransactionType.INCOME || t.type === types_1.TransactionType.CREDIT)
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === types_1.TransactionType.EXPENSE || t.type === types_1.TransactionType.DEBIT)
            .reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpenses;
        // Group transactions by category
        const incomeByCategory = transactions
            .filter(t => t.type === types_1.TransactionType.INCOME || t.type === types_1.TransactionType.CREDIT)
            .reduce((acc, t) => {
            const category = t.category || 'Uncategorized';
            if (!acc[category])
                acc[category] = 0;
            acc[category] += t.amount;
            return acc;
        }, {});
        const expensesByCategory = transactions
            .filter(t => t.type === types_1.TransactionType.EXPENSE || t.type === types_1.TransactionType.DEBIT)
            .reduce((acc, t) => {
            const category = t.category || 'Uncategorized';
            if (!acc[category])
                acc[category] = 0;
            acc[category] += t.amount;
            return acc;
        }, {});
        // Create Excel workbook
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'Financial Hub';
        workbook.created = new Date();
        // Add summary worksheet
        const summarySheet = workbook.addWorksheet('Summary');
        // Add title
        summarySheet.mergeCells('A1:D1');
        const titleCell = summarySheet.getCell('A1');
        titleCell.value = 'Financial Hub - Financial Report';
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };
        // Add report period
        summarySheet.mergeCells('A2:D2');
        const periodCell = summarySheet.getCell('A2');
        periodCell.value = `Report Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'All time'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`;
        periodCell.alignment = { horizontal: 'center' };
        // Add financial summary
        summarySheet.addRow([]);
        summarySheet.addRow(['Financial Summary']);
        summarySheet.getCell('A4').font = { bold: true, size: 14 };
        summarySheet.addRow(['Total Income', `₦${totalIncome.toLocaleString()}`]);
        summarySheet.addRow(['Total Expenses', `₦${totalExpenses.toLocaleString()}`]);
        summarySheet.addRow(['Net Balance', `₦${netBalance.toLocaleString()}`]);
        // Add organization statistics
        summarySheet.addRow([]);
        summarySheet.addRow(['Organization Statistics']);
        summarySheet.getCell('A8').font = { bold: true, size: 14 };
        summarySheet.addRow(['Active Members', users]);
        summarySheet.addRow(['Total Dues', dues]);
        summarySheet.addRow(['Total Levies', levies]);
        summarySheet.addRow(['Total Pledges', pledges]);
        summarySheet.addRow(['Total Donations', donations]);
        summarySheet.addRow(['Total Loans', loans]);
        // Add income by category
        summarySheet.addRow([]);
        summarySheet.addRow(['Income by Category']);
        summarySheet.getCell('A15').font = { bold: true, size: 14 };
        let row = 16;
        Object.entries(incomeByCategory).forEach(([category, amount]) => {
            summarySheet.addRow([category, `₦${amount.toLocaleString()}`]);
            row++;
        });
        // Add expenses by category
        summarySheet.addRow([]);
        summarySheet.getCell(`A${row}`).value = 'Expenses by Category';
        summarySheet.getCell(`A${row}`).font = { bold: true, size: 14 };
        row++;
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            summarySheet.addRow([category, `₦${amount.toLocaleString()}`]);
            row++;
        });
        // Add transactions worksheet
        const transactionsSheet = workbook.addWorksheet('Transactions');
        // Add headers
        transactionsSheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Amount', key: 'amount', width: 15 }
        ];
        // Style header row
        transactionsSheet.getRow(1).font = { bold: true };
        // Add transaction data
        transactions.forEach(transaction => {
            transactionsSheet.addRow({
                date: new Date(transaction.date).toLocaleDateString(),
                description: transaction.description || '',
                type: transaction.type,
                category: transaction.category || 'Uncategorized',
                amount: `₦${transaction.amount.toLocaleString()}`
            });
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=financial-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        // Write to response
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        next(error);
    }
});
exports.generateFinancialReportExcel = generateFinancialReportExcel;
/**
 * Generate members report in PDF format
 * @route GET /api/reports/members/pdf
 * @access Private (Admin only)
 */
const generateMembersReportPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a variable to track if headers have been sent
    let headersSent = false;
    try {
        // Parse query parameters
        const { startDate, endDate } = req.query;
        // Set up date filters
        const dateFilter = {};
        if (startDate) {
            dateFilter.dateJoined = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.dateJoined)
                dateFilter.dateJoined = {};
            dateFilter.dateJoined.$lte = new Date(endDate);
        }
        // Fetch members from the database
        const members = yield user_model_1.default.find(Object.assign({ role: 'member' }, dateFilter)).sort({ dateJoined: -1 });
        // Set up the PDF document
        const doc = new pdfkit_1.default({ margin: 50 });
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=members-report.pdf');
        headersSent = true;
        // Pipe the PDF to the response
        doc.pipe(res);
        // Add title
        doc.fontSize(20).text('Members Report', { align: 'center' });
        doc.moveDown();
        // Add date range if provided
        if (startDate || endDate) {
            let dateText = 'Date Range: ';
            if (startDate)
                dateText += `From ${startDate}`;
            if (endDate)
                dateText += ` To ${endDate}`;
            doc.fontSize(12).text(dateText, { align: 'center' });
            doc.moveDown();
        }
        // Add generation date
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);
        // Add summary statistics
        doc.fontSize(16).text('Summary Statistics', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Members: ${members.length}`);
        // Count active members
        const activeMembers = members.filter(member => member.isActive).length;
        doc.text(`Active Members: ${activeMembers}`);
        doc.text(`Inactive Members: ${members.length - activeMembers}`);
        // Count verified members
        const verifiedMembers = members.filter(member => member.isEmailVerified).length;
        doc.text(`Email Verified Members: ${verifiedMembers}`);
        doc.text(`Unverified Members: ${members.length - verifiedMembers}`);
        doc.moveDown(2);
        // Add member list
        doc.fontSize(16).text('Member List', { underline: true });
        doc.moveDown();
        // Set up table headers
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidths = [150, 150, 100, 100];
        // Draw table headers
        doc.fontSize(10).text('Name', tableLeft, tableTop);
        doc.text('Email', tableLeft + colWidths[0], tableTop);
        doc.text('Phone', tableLeft + colWidths[0] + colWidths[1], tableTop);
        doc.text('Date Joined', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
        doc.moveDown();
        let rowTop = doc.y;
        // Draw horizontal line
        doc.moveTo(tableLeft, rowTop - 5)
            .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowTop - 5)
            .stroke();
        // Draw member rows
        members.forEach((member, index) => {
            // Check if we need a new page
            if (rowTop > doc.page.height - 100) {
                doc.addPage();
                rowTop = 50;
                // Redraw headers on new page
                doc.fontSize(10).text('Name', tableLeft, rowTop);
                doc.text('Email', tableLeft + colWidths[0], rowTop);
                doc.text('Phone', tableLeft + colWidths[0] + colWidths[1], rowTop);
                doc.text('Date Joined', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop);
                doc.moveDown();
                rowTop = doc.y;
                // Draw horizontal line
                doc.moveTo(tableLeft, rowTop - 5)
                    .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowTop - 5)
                    .stroke();
            }
            // Draw member data
            const fullName = `${member.firstName} ${member.lastName}`;
            const dateJoined = new Date(member.dateJoined).toLocaleDateString();
            doc.fontSize(9).text(fullName, tableLeft, rowTop, { width: colWidths[0] });
            doc.text(member.email, tableLeft + colWidths[0], rowTop, { width: colWidths[1] });
            doc.text(member.phoneNumber || 'N/A', tableLeft + colWidths[0] + colWidths[1], rowTop, { width: colWidths[2] });
            doc.text(dateJoined, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], rowTop, { width: colWidths[3] });
            // Move to next row
            doc.moveDown();
            rowTop = doc.y;
            // Draw horizontal line after each row except the last one
            if (index < members.length - 1) {
                doc.moveTo(tableLeft, rowTop - 5)
                    .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], rowTop - 5)
                    .stroke();
            }
        });
        // Finalize the PDF and end the response
        doc.end();
    }
    catch (error) {
        console.error('Error generating members report PDF:', error);
        // If headers have already been sent, we can't send a proper error response
        if (headersSent) {
            // Try to end the response if possible
            try {
                res.end();
            }
            catch (endError) {
                console.error('Error ending response after error:', endError);
            }
            return;
        }
        // If headers haven't been sent, pass the error to the error handler
        next(new error_middleware_1.AppError(error.message || 'Failed to generate members report', 500));
    }
});
exports.generateMembersReportPDF = generateMembersReportPDF;
/**
 * Generate members report in Excel format
 * @route GET /api/reports/members/excel
 * @access Private (Admin only)
 */
const generateMembersReportExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse query parameters
        const { startDate, endDate } = req.query;
        // Set up date filters
        const dateFilter = {};
        if (startDate) {
            dateFilter.dateJoined = { $gte: new Date(startDate) };
        }
        if (endDate) {
            if (!dateFilter.dateJoined)
                dateFilter.dateJoined = {};
            dateFilter.dateJoined.$lte = new Date(endDate);
        }
        // Fetch members from the database
        const members = yield user_model_1.default.find(Object.assign({ role: 'member' }, dateFilter)).sort({ dateJoined: -1 });
        // Create a new Excel workbook and worksheet
        const workbook = new exceljs_1.default.Workbook();
        workbook.creator = 'Financial Hub';
        workbook.created = new Date();
        const worksheet = workbook.addWorksheet('Members');
        // Add title
        worksheet.mergeCells('A1:E1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'Members Report';
        titleCell.font = { size: 16, bold: true };
        titleCell.alignment = { horizontal: 'center' };
        // Add date range if provided
        let currentRow = 2;
        if (startDate || endDate) {
            worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
            let dateText = 'Date Range: ';
            if (startDate)
                dateText += `From ${startDate}`;
            if (endDate)
                dateText += ` To ${endDate}`;
            const dateRangeCell = worksheet.getCell(`A${currentRow}`);
            dateRangeCell.value = dateText;
            dateRangeCell.alignment = { horizontal: 'center' };
            currentRow++;
        }
        // Add generation date
        worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
        const generationDateCell = worksheet.getCell(`A${currentRow}`);
        generationDateCell.value = `Generated on: ${new Date().toLocaleDateString()}`;
        generationDateCell.alignment = { horizontal: 'center' };
        currentRow += 2;
        // Add summary statistics
        worksheet.getCell(`A${currentRow}`).value = 'Summary Statistics';
        worksheet.getCell(`A${currentRow}`).font = { size: 14, bold: true, underline: true };
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = `Total Members: ${members.length}`;
        currentRow++;
        // Count active members
        const activeMembers = members.filter(member => member.isActive).length;
        worksheet.getCell(`A${currentRow}`).value = `Active Members: ${activeMembers}`;
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = `Inactive Members: ${members.length - activeMembers}`;
        currentRow++;
        // Count verified members
        const verifiedMembers = members.filter(member => member.isEmailVerified).length;
        worksheet.getCell(`A${currentRow}`).value = `Email Verified Members: ${verifiedMembers}`;
        currentRow++;
        worksheet.getCell(`A${currentRow}`).value = `Unverified Members: ${members.length - verifiedMembers}`;
        currentRow += 2;
        // Add member list
        worksheet.getCell(`A${currentRow}`).value = 'Member List';
        worksheet.getCell(`A${currentRow}`).font = { size: 14, bold: true, underline: true };
        currentRow++;
        // Add table headers
        const headers = ['Member ID', 'Name', 'Email', 'Phone', 'Date Joined', 'Status', 'Verified'];
        worksheet.getRow(currentRow).values = headers;
        worksheet.getRow(currentRow).font = { bold: true };
        worksheet.getRow(currentRow).alignment = { horizontal: 'center' };
        currentRow++;
        // Add member data
        members.forEach(member => {
            const fullName = `${member.firstName} ${member.lastName}`;
            const dateJoined = new Date(member.dateJoined).toLocaleDateString();
            const status = member.isActive ? 'Active' : 'Inactive';
            const verified = member.isEmailVerified ? 'Verified' : 'Unverified';
            worksheet.getRow(currentRow).values = [
                member.membershipId || 'N/A',
                fullName,
                member.email,
                member.phoneNumber || 'N/A',
                dateJoined,
                status,
                verified
            ];
            currentRow++;
        });
        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = 20;
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=members-report.xlsx');
        // Write the workbook to the response
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error generating members report Excel:', error);
        next(new error_middleware_1.AppError(error.message || 'Failed to generate members report', 500));
    }
});
exports.generateMembersReportExcel = generateMembersReportExcel;
/**
 * Generate payments report in PDF format
 * @route GET /api/reports/payments/pdf
 * @access Private (Admin only)
 */
const generatePaymentsReportPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a variable to track if headers have been sent
    let headersSent = false;
    try {
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=payments-report.pdf');
        headersSent = true;
        // Create a simple PDF document for now
        const doc = new pdfkit_1.default({ margin: 50 });
        doc.pipe(res);
        doc.fontSize(20).text('Payments Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('This report is under development.', { align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error('Error generating payments report PDF:', error);
        if (headersSent) {
            try {
                res.end();
            }
            catch (endError) {
                console.error('Error ending response after error:', endError);
            }
            return;
        }
        next(new error_middleware_1.AppError(error.message || 'Failed to generate payments report', 500));
    }
});
exports.generatePaymentsReportPDF = generatePaymentsReportPDF;
/**
 * Generate payments report in Excel format
 * @route GET /api/reports/payments/excel
 * @access Private (Admin only)
 */
const generatePaymentsReportExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create a simple Excel workbook for now
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Payments');
        worksheet.getCell('A1').value = 'Payments Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A3').value = 'This report is under development.';
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=payments-report.xlsx');
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error generating payments report Excel:', error);
        next(new error_middleware_1.AppError(error.message || 'Failed to generate payments report', 500));
    }
});
exports.generatePaymentsReportExcel = generatePaymentsReportExcel;
/**
 * Generate loans report in PDF format
 * @route GET /api/reports/loans/pdf
 * @access Private (Admin only)
 */
const generateLoansReportPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let headersSent = false;
    try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=loans-report.pdf');
        headersSent = true;
        const doc = new pdfkit_1.default({ margin: 50 });
        doc.pipe(res);
        doc.fontSize(20).text('Loans Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('This report is under development.', { align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error('Error generating loans report PDF:', error);
        if (headersSent) {
            try {
                res.end();
            }
            catch (endError) {
                console.error('Error ending response after error:', endError);
            }
            return;
        }
        next(new error_middleware_1.AppError(error.message || 'Failed to generate loans report', 500));
    }
});
exports.generateLoansReportPDF = generateLoansReportPDF;
/**
 * Generate loans report in Excel format
 * @route GET /api/reports/loans/excel
 * @access Private (Admin only)
 */
const generateLoansReportExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Loans');
        worksheet.getCell('A1').value = 'Loans Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A3').value = 'This report is under development.';
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=loans-report.xlsx');
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error generating loans report Excel:', error);
        next(new error_middleware_1.AppError(error.message || 'Failed to generate loans report', 500));
    }
});
exports.generateLoansReportExcel = generateLoansReportExcel;
/**
 * Generate dues report in PDF format
 * @route GET /api/reports/dues/pdf
 * @access Private (Admin only)
 */
const generateDuesReportPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let headersSent = false;
    try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=dues-report.pdf');
        headersSent = true;
        const doc = new pdfkit_1.default({ margin: 50 });
        doc.pipe(res);
        doc.fontSize(20).text('Dues Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('This report is under development.', { align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error('Error generating dues report PDF:', error);
        if (headersSent) {
            try {
                res.end();
            }
            catch (endError) {
                console.error('Error ending response after error:', endError);
            }
            return;
        }
        next(new error_middleware_1.AppError(error.message || 'Failed to generate dues report', 500));
    }
});
exports.generateDuesReportPDF = generateDuesReportPDF;
/**
 * Generate dues report in Excel format
 * @route GET /api/reports/dues/excel
 * @access Private (Admin only)
 */
const generateDuesReportExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Dues');
        worksheet.getCell('A1').value = 'Dues Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A3').value = 'This report is under development.';
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=dues-report.xlsx');
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error generating dues report Excel:', error);
        next(new error_middleware_1.AppError(error.message || 'Failed to generate dues report', 500));
    }
});
exports.generateDuesReportExcel = generateDuesReportExcel;
