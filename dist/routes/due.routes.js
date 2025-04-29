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
const dueController = __importStar(require("../controllers/due.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const types_1 = require("../types");
const router = (0, express_1.Router)();
// Member dues routes - must come before /:id routes to avoid conflicts
// Get all member dues
router.get('/members', auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), dueController.getAllMemberDues);
// Get current user's dues
router.get('/members/my-dues', auth_middleware_1.authenticate, dueController.getMyDues);
// Get member dues by user ID
router.get('/members/user/:userId', auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), dueController.getMemberDuesByUserId);
// Get member due by ID
router.get('/members/:id', auth_middleware_1.authenticate, dueController.getMemberDueById);
// Update member due
router.put('/members/:id', auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), dueController.updateMemberDue);
// Regular dues routes
// Get all dues
router.get('/', auth_middleware_1.authenticate, dueController.getAllDues);
// Get unpaid dues
router.get('/unpaid', auth_middleware_1.authenticate, dueController.getUnpaidDues);
// Create new due
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), dueController.createDue);
// Get due by ID - must come after all other GET routes with specific paths
router.get('/:id', auth_middleware_1.authenticate, dueController.getDueById);
// Update due
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), dueController.updateDue);
// Delete due
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_2.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN), dueController.deleteDue);
exports.default = router;
