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
exports.fulfillPledge = exports.deletePledge = exports.updatePledge = exports.getPledgeById = exports.getPledgesByUserId = exports.getAllPledges = exports.createPledge = void 0;
const pledge_model_1 = __importDefault(require("../models/pledge.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Create a new pledge
 * @param pledgeData Pledge data
 * @returns Created pledge
 */
const createPledge = (pledgeData) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user exists
    const userExists = yield user_model_1.default.findById(pledgeData.user);
    if (!userExists) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    // Create pledge
    const pledge = yield pledge_model_1.default.create(pledgeData);
    return pledge;
});
exports.createPledge = createPledge;
/**
 * Get all pledges
 * @returns List of all pledges
 */
const getAllPledges = () => __awaiter(void 0, void 0, void 0, function* () {
    const pledges = yield pledge_model_1.default.find()
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return pledges;
});
exports.getAllPledges = getAllPledges;
/**
 * Get pledges by user ID
 * @param userId User ID
 * @returns List of user's pledges
 */
const getPledgesByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const pledges = yield pledge_model_1.default.find({ user: userId })
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return pledges;
});
exports.getPledgesByUserId = getPledgesByUserId;
/**
 * Get pledge by ID
 * @param pledgeId Pledge ID
 * @returns Pledge object
 */
const getPledgeById = (pledgeId) => __awaiter(void 0, void 0, void 0, function* () {
    const pledge = yield pledge_model_1.default.findById(pledgeId)
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId');
    if (!pledge) {
        throw new error_middleware_1.AppError('Pledge not found', 404);
    }
    return pledge;
});
exports.getPledgeById = getPledgeById;
/**
 * Update pledge
 * @param pledgeId Pledge ID
 * @param updateData Updated pledge data
 * @returns Updated pledge
 */
const updatePledge = (pledgeId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const pledge = yield pledge_model_1.default.findByIdAndUpdate(pledgeId, updateData, { new: true, runValidators: true })
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId');
    if (!pledge) {
        throw new error_middleware_1.AppError('Pledge not found', 404);
    }
    return pledge;
});
exports.updatePledge = updatePledge;
/**
 * Delete pledge
 * @param pledgeId Pledge ID
 * @returns Success message
 */
const deletePledge = (pledgeId) => __awaiter(void 0, void 0, void 0, function* () {
    const pledge = yield pledge_model_1.default.findById(pledgeId);
    if (!pledge) {
        throw new error_middleware_1.AppError('Pledge not found', 404);
    }
    yield pledge_model_1.default.findByIdAndDelete(pledgeId);
    return { message: 'Pledge deleted successfully' };
});
exports.deletePledge = deletePledge;
/**
 * Fulfill pledge with payment
 * @param pledgeId Pledge ID
 * @param paymentId Payment ID
 * @returns Updated pledge
 */
const fulfillPledge = (pledgeId, paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const pledge = yield pledge_model_1.default.findByIdAndUpdate(pledgeId, {
        status: types_1.PaymentStatus.APPROVED,
        paymentId,
        fulfillmentDate: new Date(),
    }, { new: true, runValidators: true })
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId');
    if (!pledge) {
        throw new error_middleware_1.AppError('Pledge not found', 404);
    }
    return pledge;
});
exports.fulfillPledge = fulfillPledge;
