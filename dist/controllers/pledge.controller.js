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
exports.fulfillPledge = exports.deletePledge = exports.updatePledge = exports.getPledgeById = exports.getMyPledges = exports.getPledgesByUserId = exports.getAllPledges = exports.createPledge = void 0;
const pledgeService = __importStar(require("../services/pledge.service"));
const response_utils_1 = require("../utils/response.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const types_1 = require("../types");
/**
 * Create a new pledge
 * @route POST /api/pledges
 * @access Private
 */
const createPledge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pledgeData = Object.assign(Object.assign({}, req.body), { user: req.user.role === types_1.UserRole.ADMIN || req.user.role === types_1.UserRole.ADMIN_LEVEL_1 || req.user.role === types_1.UserRole.ADMIN_LEVEL_2 || req.user.role === types_1.UserRole.SUPER_ADMIN ? req.body.user : req.user._id });
        const pledge = yield pledgeService.createPledge(pledgeData);
        (0, response_utils_1.sendSuccess)(res, 201, 'Pledge created successfully', { pledge });
    }
    catch (error) {
        next(error);
    }
});
exports.createPledge = createPledge;
/**
 * Get all pledges
 * @route GET /api/pledges
 * @access Private (Admin only)
 */
const getAllPledges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pledges = yield pledgeService.getAllPledges();
        (0, response_utils_1.sendSuccess)(res, 200, 'Pledges retrieved successfully', { pledges });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllPledges = getAllPledges;
/**
 * Get pledges by user ID
 * @route GET /api/pledges/user/:userId
 * @access Private (Admin or own user)
 */
const getPledgesByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user is requesting their own pledges or has an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role) && req.user._id.toString() !== userId) {
            throw new error_middleware_1.AppError('Not authorized to access these pledges', 403);
        }
        const pledges = yield pledgeService.getPledgesByUserId(userId);
        (0, response_utils_1.sendSuccess)(res, 200, 'Pledges retrieved successfully', { pledges });
    }
    catch (error) {
        next(error);
    }
});
exports.getPledgesByUserId = getPledgesByUserId;
/**
 * Get current user's pledges
 * @route GET /api/pledges/my-pledges
 * @access Private
 */
const getMyPledges = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pledges = yield pledgeService.getPledgesByUserId(req.user._id);
        (0, response_utils_1.sendSuccess)(res, 200, 'Pledges retrieved successfully', { pledges });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyPledges = getMyPledges;
/**
 * Get pledge by ID
 * @route GET /api/pledges/:id
 * @access Private (Admin or pledge owner)
 */
const getPledgeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pledge = yield pledgeService.getPledgeById(id);
        // Check if user is the pledge owner or has an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role) &&
            pledge.user._id.toString() !== req.user._id.toString()) {
            throw new error_middleware_1.AppError('Not authorized to access this pledge', 403);
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Pledge retrieved successfully', { pledge });
    }
    catch (error) {
        next(error);
    }
});
exports.getPledgeById = getPledgeById;
/**
 * Update pledge
 * @route PUT /api/pledges/:id
 * @access Private (Admin or pledge owner)
 */
const updatePledge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get pledge to check ownership
        const pledge = yield pledgeService.getPledgeById(id);
        // Check if user is the pledge owner or has an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role) &&
            pledge.user._id.toString() !== req.user._id.toString()) {
            throw new error_middleware_1.AppError('Not authorized to update this pledge', 403);
        }
        const updateData = req.body;
        const updatedPledge = yield pledgeService.updatePledge(id, updateData);
        (0, response_utils_1.sendSuccess)(res, 200, 'Pledge updated successfully', { pledge: updatedPledge });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePledge = updatePledge;
/**
 * Delete pledge
 * @route DELETE /api/pledges/:id
 * @access Private (Admin only)
 */
const deletePledge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield pledgeService.deletePledge(id);
        (0, response_utils_1.sendSuccess)(res, 200, result.message);
    }
    catch (error) {
        next(error);
    }
});
exports.deletePledge = deletePledge;
/**
 * Fulfill pledge with payment
 * @route PATCH /api/pledges/:id/fulfill
 * @access Private (Admin only)
 */
const fulfillPledge = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { paymentId } = req.body;
        if (!paymentId) {
            throw new error_middleware_1.AppError('Payment ID is required', 400);
        }
        const pledge = yield pledgeService.fulfillPledge(id, paymentId);
        (0, response_utils_1.sendSuccess)(res, 200, 'Pledge fulfilled successfully', { pledge });
    }
    catch (error) {
        next(error);
    }
});
exports.fulfillPledge = fulfillPledge;
