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
const loanController = __importStar(require("../controllers/loan.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Get all loans with summary statistics - Only Admin Level 2 and above can access loan management
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), loanController.getAllLoans);
// Get current user's loans - specific routes must come BEFORE parameterized routes
router.get('/my-loans', auth_middleware_1.authenticate, loanController.getMyLoans);
router.get('/user/my-loans', auth_middleware_1.authenticate, loanController.getMyLoans);
// Get loans by member ID - Only Admin Level 2 and above
router.get('/member/:userId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), loanController.getLoansByUserId);
// Add endpoints for active loans and history
router.get('/active', auth_middleware_1.authenticate, loanController.getActiveLoans);
router.get('/history', auth_middleware_1.authenticate, loanController.getLoanHistory);
// Get loan by ID
router.get('/detail/:id', auth_middleware_1.authenticate, loanController.getLoanById);
// Create new loan application
router.post('/', auth_middleware_1.authenticate, loanController.createLoan);
// Approve loan - Only Admin Level 2 and above
router.put('/:id/approve', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), loanController.approveLoan);
// Reject loan - Only Admin Level 2 and above
router.put('/:id/reject', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), loanController.rejectLoan);
// Get loans by status - parameterized route should come AFTER specific routes - Only Admin Level 2 and above
router.get('/:status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), loanController.getLoansByStatus);
exports.default = router;
