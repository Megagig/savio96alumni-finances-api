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
exports.processDonation = exports.deleteDonation = exports.updateDonation = exports.getDonationById = exports.getDonationsByUserId = exports.getAllDonations = exports.createDonation = void 0;
const donation_model_1 = __importDefault(require("../models/donation.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Create a new donation
 * @param donationData Donation data
 * @returns Created donation
 */
const createDonation = (donationData) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify user exists
    const userExists = yield user_model_1.default.findById(donationData.user);
    if (!userExists) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    // Create donation
    const donation = yield donation_model_1.default.create(donationData);
    return donation;
});
exports.createDonation = createDonation;
/**
 * Get all donations
 * @returns List of all donations
 */
const getAllDonations = () => __awaiter(void 0, void 0, void 0, function* () {
    const donations = yield donation_model_1.default.find()
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return donations;
});
exports.getAllDonations = getAllDonations;
/**
 * Get donations by user ID
 * @param userId User ID
 * @returns List of user's donations
 */
const getDonationsByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const donations = yield donation_model_1.default.find({ user: userId })
        .populate('paymentId')
        .sort({ createdAt: -1 });
    return donations;
});
exports.getDonationsByUserId = getDonationsByUserId;
/**
 * Get donation by ID
 * @param donationId Donation ID
 * @returns Donation object
 */
const getDonationById = (donationId) => __awaiter(void 0, void 0, void 0, function* () {
    const donation = yield donation_model_1.default.findById(donationId)
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId');
    if (!donation) {
        throw new error_middleware_1.AppError('Donation not found', 404);
    }
    return donation;
});
exports.getDonationById = getDonationById;
/**
 * Update donation
 * @param donationId Donation ID
 * @param updateData Updated donation data
 * @returns Updated donation
 */
const updateDonation = (donationId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const donation = yield donation_model_1.default.findByIdAndUpdate(donationId, updateData, { new: true, runValidators: true })
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId');
    if (!donation) {
        throw new error_middleware_1.AppError('Donation not found', 404);
    }
    return donation;
});
exports.updateDonation = updateDonation;
/**
 * Delete donation
 * @param donationId Donation ID
 * @returns Success message
 */
const deleteDonation = (donationId) => __awaiter(void 0, void 0, void 0, function* () {
    const donation = yield donation_model_1.default.findById(donationId);
    if (!donation) {
        throw new error_middleware_1.AppError('Donation not found', 404);
    }
    yield donation_model_1.default.findByIdAndDelete(donationId);
    return { message: 'Donation deleted successfully' };
});
exports.deleteDonation = deleteDonation;
/**
 * Process donation with payment
 * @param donationId Donation ID
 * @param paymentId Payment ID
 * @returns Updated donation
 */
const processDonation = (donationId, paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const donation = yield donation_model_1.default.findByIdAndUpdate(donationId, {
        status: types_1.PaymentStatus.APPROVED,
        paymentId,
    }, { new: true, runValidators: true })
        .populate('user', 'firstName lastName email membershipId')
        .populate('paymentId');
    if (!donation) {
        throw new error_middleware_1.AppError('Donation not found', 404);
    }
    return donation;
});
exports.processDonation = processDonation;
