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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnpaidDues = exports.updateMemberDue = exports.getMemberDueById = exports.getMyDues = exports.getMemberDuesByUserId = exports.getAllMemberDues = exports.deleteDue = exports.updateDue = exports.getDueById = exports.getAllDues = exports.createDue = void 0;
const dueService = __importStar(require("../services/due.service"));
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const types_1 = require("../types");
/**
 * Create a new due
 * @route POST /api/dues
 * @access Private (Admin only)
 */
const createDue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dueData = req.body;
        const due = yield dueService.createDue(dueData);
        (0, response_utils_1.sendSuccess)(res, 201, 'Due created successfully', { due });
    }
    catch (error) {
        next(error);
    }
});
exports.createDue = createDue;
/**
 * Get all dues
 * @route GET /api/dues
 * @access Private (Admin only)
 */
const getAllDues = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dues = yield dueService.getAllDues();
        (0, response_utils_1.sendSuccess)(res, 200, 'Dues retrieved successfully', { dues });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllDues = getAllDues;
/**
 * Get due by ID
 * @route GET /api/dues/:id
 * @access Private (Admin only)
 */
const getDueById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const due = yield dueService.getDueById(id);
        (0, response_utils_1.sendSuccess)(res, 200, 'Due retrieved successfully', { due });
    }
    catch (error) {
        next(error);
    }
});
exports.getDueById = getDueById;
/**
 * Update due
 * @route PUT /api/dues/:id
 * @access Private (Admin only)
 */
const updateDue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const due = yield dueService.updateDue(id, updateData);
        (0, response_utils_1.sendSuccess)(res, 200, 'Due updated successfully', { due });
    }
    catch (error) {
        next(error);
    }
});
exports.updateDue = updateDue;
/**
 * Delete due
 * @route DELETE /api/dues/:id
 * @access Private (Admin only)
 */
const deleteDue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield dueService.deleteDue(id);
        (0, response_utils_1.sendSuccess)(res, 200, result.message);
    }
    catch (error) {
        next(error);
    }
});
exports.deleteDue = deleteDue;
/**
 * Get all member dues
 * @route GET /api/dues/members
 * @access Private (Admin only)
 */
const getAllMemberDues = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberDues = yield dueService.getAllMemberDues();
        (0, response_utils_1.sendSuccess)(res, 200, 'Member dues retrieved successfully', { memberDues });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMemberDues = getAllMemberDues;
/**
 * Get member dues by user ID
 * @route GET /api/dues/members/user/:userId
 * @access Private (Admin or own user)
 */
const getMemberDuesByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user is requesting their own dues or has an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role) && req.user._id.toString() !== userId) {
            throw new error_middleware_1.AppError('Not authorized to access these dues', 403);
        }
        const memberDues = yield dueService.getMemberDuesByUserId(userId);
        (0, response_utils_1.sendSuccess)(res, 200, 'Member dues retrieved successfully', { memberDues });
    }
    catch (error) {
        next(error);
    }
});
exports.getMemberDuesByUserId = getMemberDuesByUserId;
/**
 * Get current user's dues
 * @route GET /api/dues/members/my-dues
 * @access Private
 */
const getMyDues = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberDues = yield dueService.getMemberDuesByUserId(req.user._id);
        (0, response_utils_1.sendSuccess)(res, 200, 'Member dues retrieved successfully', { memberDues });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyDues = getMyDues;
/**
 * Get member due by ID
 * @route GET /api/dues/members/:id
 * @access Private (Admin or due owner)
 */
const getMemberDueById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const memberDue = yield dueService.getMemberDueById(id);
        // Check if user is the due owner or is admin
        if (req.user.role !== 'admin' &&
            memberDue.user._id.toString() !== req.user._id.toString()) {
            throw new error_middleware_1.AppError('Not authorized to access this due', 403);
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Member due retrieved successfully', { memberDue });
    }
    catch (error) {
        next(error);
    }
});
exports.getMemberDueById = getMemberDueById;
/**
 * Update member due
 * @route PUT /api/dues/members/:id
 * @access Private (Admin only)
 */
const updateMemberDue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const memberDue = yield dueService.updateMemberDue(id, updateData);
        (0, response_utils_1.sendSuccess)(res, 200, 'Member due updated successfully', { memberDue });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMemberDue = updateMemberDue;
/**
 * Get unpaid dues for the current user
 * @route GET /api/dues/unpaid
 * @access Private
 */
const getUnpaidDues = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user's dues
        const memberDues = yield dueService.getMemberDuesByUserId(req.user._id);
        // Filter to only include unpaid dues (status is PENDING)
        const unpaidDues = memberDues.filter(due => due.status === 'pending');
        (0, response_utils_1.sendSuccess)(res, 200, 'Unpaid dues retrieved successfully', { unpaidDues });
    }
    catch (error) {
        next(error);
    }
});
exports.getUnpaidDues = getUnpaidDues;
