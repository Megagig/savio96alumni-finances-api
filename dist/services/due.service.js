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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMemberDue = exports.getMemberDueById = exports.getMemberDuesByUserId = exports.getAllMemberDues = exports.deleteDue = exports.updateDue = exports.getDueById = exports.getAllDues = exports.createDue = void 0;
const due_model_1 = __importDefault(require("../models/due.model"));
const memberDue_model_1 = __importDefault(require("../models/memberDue.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Create a new due
 * @param dueData Due data with optional member selection
 * @returns Created due
 */
const createDue = (dueData) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract member selection data
    const { assignToAll, selectedMembers } = dueData, dueFields = __rest(dueData, ["assignToAll", "selectedMembers"]);
    // Create the due
    const due = yield due_model_1.default.create(dueFields);
    let memberDues = [];
    // If assignToAll is true or not specified, assign to all active members
    if (assignToAll === undefined || assignToAll === true) {
        const activeMembers = yield user_model_1.default.find({ isActive: true, role: 'member' });
        memberDues = activeMembers.map(member => ({
            user: member._id,
            due: due._id,
            amountPaid: 0,
            balance: dueFields.amount,
            status: types_1.PaymentStatus.PENDING,
        }));
    }
    // Otherwise, assign to selected members
    else if (selectedMembers && selectedMembers.length > 0) {
        memberDues = selectedMembers.map(memberId => ({
            user: memberId,
            due: due._id,
            amountPaid: 0,
            balance: dueFields.amount,
            status: types_1.PaymentStatus.PENDING,
        }));
    }
    if (memberDues.length > 0) {
        yield memberDue_model_1.default.insertMany(memberDues);
    }
    return due;
});
exports.createDue = createDue;
/**
 * Get all dues
 * @returns List of all dues
 */
const getAllDues = () => __awaiter(void 0, void 0, void 0, function* () {
    const dues = yield due_model_1.default.find().sort({ dueDate: -1 });
    return dues;
});
exports.getAllDues = getAllDues;
/**
 * Get due by ID
 * @param dueId Due ID
 * @returns Due object
 */
const getDueById = (dueId) => __awaiter(void 0, void 0, void 0, function* () {
    const due = yield due_model_1.default.findById(dueId);
    if (!due) {
        throw new error_middleware_1.AppError('Due not found', 404);
    }
    return due;
});
exports.getDueById = getDueById;
/**
 * Update due
 * @param dueId Due ID
 * @param updateData Updated due data
 * @returns Updated due
 */
const updateDue = (dueId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const due = yield due_model_1.default.findByIdAndUpdate(dueId, updateData, { new: true, runValidators: true });
    if (!due) {
        throw new error_middleware_1.AppError('Due not found', 404);
    }
    return due;
});
exports.updateDue = updateDue;
/**
 * Delete due
 * @param dueId Due ID
 * @returns Success message
 */
const deleteDue = (dueId) => __awaiter(void 0, void 0, void 0, function* () {
    const due = yield due_model_1.default.findById(dueId);
    if (!due) {
        throw new error_middleware_1.AppError('Due not found', 404);
    }
    // Delete all member dues associated with this due
    yield memberDue_model_1.default.deleteMany({ due: dueId });
    // Delete the due
    yield due_model_1.default.findByIdAndDelete(dueId);
    return { message: 'Due deleted successfully' };
});
exports.deleteDue = deleteDue;
/**
 * Get all member dues
 * @returns List of all member dues
 */
const getAllMemberDues = () => __awaiter(void 0, void 0, void 0, function* () {
    const memberDues = yield memberDue_model_1.default.find()
        .populate('user', 'firstName lastName email membershipId')
        .populate('due', 'name amount dueDate')
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return memberDues;
});
exports.getAllMemberDues = getAllMemberDues;
/**
 * Get member dues by user ID
 * @param userId User ID
 * @returns List of user's dues
 */
const getMemberDuesByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const memberDues = yield memberDue_model_1.default.find({ user: userId })
        .populate('due', 'name amount dueDate description')
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return memberDues;
});
exports.getMemberDuesByUserId = getMemberDuesByUserId;
/**
 * Get member due by ID
 * @param memberDueId Member due ID
 * @returns Member due object
 */
const getMemberDueById = (memberDueId) => __awaiter(void 0, void 0, void 0, function* () {
    const memberDue = yield memberDue_model_1.default.findById(memberDueId)
        .populate('user', 'firstName lastName email membershipId')
        .populate('due', 'name amount dueDate description')
        .populate('paymentId');
    if (!memberDue) {
        throw new error_middleware_1.AppError('Member due not found', 404);
    }
    return memberDue;
});
exports.getMemberDueById = getMemberDueById;
/**
 * Update member due
 * @param memberDueId Member due ID
 * @param updateData Updated member due data
 * @returns Updated member due
 */
const updateMemberDue = (memberDueId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const memberDue = yield memberDue_model_1.default.findByIdAndUpdate(memberDueId, updateData, { new: true, runValidators: true })
        .populate('user', 'firstName lastName email membershipId')
        .populate('due', 'name amount dueDate description')
        .populate('paymentId');
    if (!memberDue) {
        throw new error_middleware_1.AppError('Member due not found', 404);
    }
    return memberDue;
});
exports.updateMemberDue = updateMemberDue;
