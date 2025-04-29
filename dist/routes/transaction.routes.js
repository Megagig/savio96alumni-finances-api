"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionController = __importStar(require("../controllers/transaction.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Get all transactions
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.getAllTransactions);
// Get transaction summary
router.get('/summary', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.getTransactionSummary);
// Export to Excel
router.get('/export/excel', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.exportToExcel);
// Export to PDF
router.get('/export/pdf', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.exportToPDF);
// Get income transactions
router.get('/income', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.getIncomeTransactions);
// Get expense transactions
router.get('/expense', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.getExpenseTransactions);
// Add plural route for backward compatibility
router.get('/expenses', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.getExpenseTransactions);
// Get balance transactions
router.get('/balance', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.getBalanceTransactions);
// Get transaction by ID
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.getTransactionById);
// Create transaction
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.createTransaction);
// Update transaction
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.updateTransaction);
// Delete transaction
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), transactionController.deleteTransaction);
exports.default = router;
