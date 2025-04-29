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
exports.updateMemberLevy = exports.getMyLevies = exports.getMemberLeviesByUserId = exports.getMemberLevyById = exports.getAllMemberLevies = exports.deleteLevy = exports.updateLevy = exports.createLevy = exports.getLevyById = exports.getAllLevies = void 0;
const levy_model_1 = __importDefault(require("../models/levy.model"));
const memberLevy_model_1 = __importDefault(require("../models/memberLevy.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const response_utils_1 = require("../utils/response.utils");
const types_1 = require("../types");
// Get all levies
const getAllLevies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const levies = yield levy_model_1.default.find().sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'Levies retrieved successfully', { levies });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllLevies = getAllLevies;
// Get levy by ID
const getLevyById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const levy = yield levy_model_1.default.findById(id);
        if (!levy) {
            return (0, response_utils_1.sendError)(res, 404, 'Levy not found');
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Levy retrieved successfully', { levy });
    }
    catch (error) {
        next(error);
    }
});
exports.getLevyById = getLevyById;
// Create new levy
const createLevy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, amount, description, startDate, endDate, isActive, assignToAll, selectedMembers } = req.body;
        // Create new levy
        const newLevy = new levy_model_1.default({
            title,
            amount,
            description,
            startDate,
            endDate,
            isActive: isActive !== undefined ? isActive : true
        });
        const savedLevy = yield newLevy.save();
        // If assignToAll is true, create member levies for all active members
        if (assignToAll) {
            const activeMembers = yield user_model_1.default.find({
                role: types_1.UserRole.MEMBER,
                isActive: true
            });
            const memberLevyPromises = activeMembers.map((member) => {
                const memberLevy = new memberLevy_model_1.default({
                    user: member._id,
                    levy: savedLevy._id,
                    amountPaid: 0,
                    balance: amount,
                    status: types_1.PaymentStatus.PENDING
                });
                return memberLevy.save();
            });
            yield Promise.all(memberLevyPromises);
        }
        // Otherwise, create member levies for selected members
        else if (selectedMembers && selectedMembers.length > 0) {
            const memberLevyPromises = selectedMembers.map((memberId) => {
                const memberLevy = new memberLevy_model_1.default({
                    user: memberId,
                    levy: savedLevy._id,
                    amountPaid: 0,
                    balance: amount,
                    status: types_1.PaymentStatus.PENDING
                });
                return memberLevy.save();
            });
            yield Promise.all(memberLevyPromises);
        }
        (0, response_utils_1.sendSuccess)(res, 201, 'Levy created successfully', { levy: savedLevy });
    }
    catch (error) {
        next(error);
    }
});
exports.createLevy = createLevy;
// Update levy
const updateLevy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedLevy = yield levy_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedLevy) {
            return (0, response_utils_1.sendError)(res, 404, 'Levy not found');
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Levy updated successfully', { levy: updatedLevy });
    }
    catch (error) {
        next(error);
    }
});
exports.updateLevy = updateLevy;
// Delete levy
const deleteLevy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedLevy = yield levy_model_1.default.findByIdAndDelete(id);
        if (!deletedLevy) {
            return (0, response_utils_1.sendError)(res, 404, 'Levy not found');
        }
        // Also delete all associated member levies
        yield memberLevy_model_1.default.deleteMany({ levy: id });
        (0, response_utils_1.sendSuccess)(res, 200, 'Levy deleted successfully');
    }
    catch (error) {
        next(error);
    }
});
exports.deleteLevy = deleteLevy;
// Get all member levies
const getAllMemberLevies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberLevies = yield memberLevy_model_1.default.find()
            .populate('user', 'firstName lastName email membershipId')
            .populate('levy', 'title amount startDate endDate')
            .sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'Member levies retrieved successfully', { memberLevies });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMemberLevies = getAllMemberLevies;
// Get member levy by ID
const getMemberLevyById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const memberLevy = yield memberLevy_model_1.default.findById(id)
            .populate('user', 'firstName lastName email membershipId')
            .populate('levy', 'title amount startDate endDate');
        if (!memberLevy) {
            return (0, response_utils_1.sendError)(res, 404, 'Member levy not found');
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Member levy retrieved successfully', { memberLevy });
    }
    catch (error) {
        next(error);
    }
});
exports.getMemberLevyById = getMemberLevyById;
// Get member levies by user ID
const getMemberLeviesByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user is requesting their own levies or has an admin role
        const adminRoles = [types_1.UserRole.ADMIN, types_1.UserRole.ADMIN_LEVEL_1, types_1.UserRole.ADMIN_LEVEL_2, types_1.UserRole.SUPER_ADMIN];
        if (!adminRoles.includes(req.user.role) && req.user._id.toString() !== userId) {
            return (0, response_utils_1.sendError)(res, 403, 'Not authorized to access these levies');
        }
        const memberLevies = yield memberLevy_model_1.default.find({ user: userId })
            .populate('levy', 'title amount startDate endDate')
            .sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'Member levies retrieved successfully', { memberLevies });
    }
    catch (error) {
        next(error);
    }
});
exports.getMemberLeviesByUserId = getMemberLeviesByUserId;
// Get current user's levies
const getMyLevies = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const memberLevies = yield memberLevy_model_1.default.find({ user: userId })
            .populate('levy', 'title amount startDate endDate')
            .sort({ createdAt: -1 });
        (0, response_utils_1.sendSuccess)(res, 200, 'Your levies retrieved successfully', { memberLevies });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyLevies = getMyLevies;
// Update member levy
const updateMemberLevy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedMemberLevy = yield memberLevy_model_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('user', 'firstName lastName email membershipId')
            .populate('levy', 'title amount startDate endDate');
        if (!updatedMemberLevy) {
            return (0, response_utils_1.sendError)(res, 404, 'Member levy not found');
        }
        (0, response_utils_1.sendSuccess)(res, 200, 'Member levy updated successfully', { memberLevy: updatedMemberLevy });
    }
    catch (error) {
        next(error);
    }
});
exports.updateMemberLevy = updateMemberLevy;
