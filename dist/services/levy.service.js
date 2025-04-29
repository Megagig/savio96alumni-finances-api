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
exports.updateMemberLevy = exports.getMemberLevyById = exports.getMemberLeviesByUserId = exports.getAllMemberLevies = exports.deleteLevy = exports.updateLevy = exports.getLevyById = exports.getAllLevies = exports.createLevy = void 0;
const levy_model_1 = __importDefault(require("../models/levy.model"));
const memberLevy_model_1 = __importDefault(require("../models/memberLevy.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Create a new levy
 * @param levyData Levy data
 * @returns Created levy
 */
const createLevy = (levyData) => __awaiter(void 0, void 0, void 0, function* () {
    const levy = yield levy_model_1.default.create(levyData);
    // Assign this levy to all active members
    const activeMembers = yield user_model_1.default.find({ isActive: true, role: 'member' });
    const memberLevies = activeMembers.map(member => ({
        user: member._id,
        levy: levy._id,
        amountPaid: 0,
        balance: levyData.amount,
        status: types_1.PaymentStatus.PENDING,
    }));
    if (memberLevies.length > 0) {
        yield memberLevy_model_1.default.insertMany(memberLevies);
    }
    return levy;
});
exports.createLevy = createLevy;
/**
 * Get all levies
 * @returns List of all levies
 */
const getAllLevies = () => __awaiter(void 0, void 0, void 0, function* () {
    const levies = yield levy_model_1.default.find().sort({ startDate: -1 });
    return levies;
});
exports.getAllLevies = getAllLevies;
/**
 * Get levy by ID
 * @param levyId Levy ID
 * @returns Levy object
 */
const getLevyById = (levyId) => __awaiter(void 0, void 0, void 0, function* () {
    const levy = yield levy_model_1.default.findById(levyId);
    if (!levy) {
        throw new error_middleware_1.AppError('Levy not found', 404);
    }
    return levy;
});
exports.getLevyById = getLevyById;
/**
 * Update levy
 * @param levyId Levy ID
 * @param updateData Updated levy data
 * @returns Updated levy
 */
const updateLevy = (levyId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const levy = yield levy_model_1.default.findByIdAndUpdate(levyId, updateData, { new: true, runValidators: true });
    if (!levy) {
        throw new error_middleware_1.AppError('Levy not found', 404);
    }
    return levy;
});
exports.updateLevy = updateLevy;
/**
 * Delete levy
 * @param levyId Levy ID
 * @returns Success message
 */
const deleteLevy = (levyId) => __awaiter(void 0, void 0, void 0, function* () {
    const levy = yield levy_model_1.default.findById(levyId);
    if (!levy) {
        throw new error_middleware_1.AppError('Levy not found', 404);
    }
    // Delete all member levies associated with this levy
    yield memberLevy_model_1.default.deleteMany({ levy: levyId });
    // Delete the levy
    yield levy_model_1.default.findByIdAndDelete(levyId);
    return { message: 'Levy deleted successfully' };
});
exports.deleteLevy = deleteLevy;
/**
 * Get all member levies
 * @returns List of all member levies
 */
const getAllMemberLevies = () => __awaiter(void 0, void 0, void 0, function* () {
    const memberLevies = yield memberLevy_model_1.default.find()
        .populate('user', 'firstName lastName email membershipId')
        .populate('levy', 'title amount startDate')
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return memberLevies;
});
exports.getAllMemberLevies = getAllMemberLevies;
/**
 * Get member levies by user ID
 * @param userId User ID
 * @returns List of user's levies
 */
const getMemberLeviesByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const memberLevies = yield memberLevy_model_1.default.find({ user: userId })
        .populate('levy', 'title amount startDate description')
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return memberLevies;
});
exports.getMemberLeviesByUserId = getMemberLeviesByUserId;
/**
 * Get member levy by ID
 * @param memberLevyId Member levy ID
 * @returns Member levy object
 */
const getMemberLevyById = (memberLevyId) => __awaiter(void 0, void 0, void 0, function* () {
    const memberLevy = yield memberLevy_model_1.default.findById(memberLevyId)
        .populate('user', 'firstName lastName email membershipId')
        .populate('levy', 'title amount startDate description')
        .populate('paymentId');
    if (!memberLevy) {
        throw new error_middleware_1.AppError('Member levy not found', 404);
    }
    return memberLevy;
});
exports.getMemberLevyById = getMemberLevyById;
/**
 * Update member levy
 * @param memberLevyId Member levy ID
 * @param updateData Updated member levy data
 * @returns Updated member levy
 */
const updateMemberLevy = (memberLevyId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const memberLevy = yield memberLevy_model_1.default.findByIdAndUpdate(memberLevyId, updateData, { new: true, runValidators: true })
        .populate('user', 'firstName lastName email membershipId')
        .populate('levy', 'title amount startDate description')
        .populate('paymentId');
    if (!memberLevy) {
        throw new error_middleware_1.AppError('Member levy not found', 404);
    }
    return memberLevy;
});
exports.updateMemberLevy = updateMemberLevy;
