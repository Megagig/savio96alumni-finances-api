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
exports.deleteDonation = exports.updateDonation = exports.createDonation = exports.getDonationsByUser = exports.getDonationById = exports.getAllDonations = void 0;
const donation_model_1 = __importDefault(require("../models/donation.model"));
const types_1 = require("../types");
const mongoose_1 = __importDefault(require("mongoose"));
// Get all donations
const getAllDonations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const donations = yield donation_model_1.default.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'Donations retrieved successfully',
            data: donations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving donations',
            error: error.message
        });
    }
});
exports.getAllDonations = getAllDonations;
// Get donation by ID
const getDonationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid donation ID'
            });
        }
        const donation = yield donation_model_1.default.findById(id)
            .populate('user', 'firstName lastName email')
            .populate('paymentId');
        if (!donation) {
            res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Donation retrieved successfully',
            data: donation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving donation',
            error: error.message
        });
    }
});
exports.getDonationById = getDonationById;
// Get donations by user ID
const getDonationsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const donations = yield donation_model_1.default.find({ user: userId })
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'User donations retrieved successfully',
            data: donations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving user donations',
            error: error.message
        });
    }
});
exports.getDonationsByUser = getDonationsByUser;
// Create new donation
const createDonation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { amount, purpose, description } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validate input
        if (!amount || amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }
        if (!purpose) {
            res.status(400).json({
                success: false,
                message: 'Purpose is required'
            });
        }
        // Create donation
        const newDonation = yield donation_model_1.default.create({
            user: userId,
            amount,
            purpose,
            description,
            donationDate: new Date(),
            status: types_1.PaymentStatus.PENDING
        });
        res.status(201).json({
            success: true,
            message: 'Donation created successfully',
            data: newDonation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating donation',
            error: error.message
        });
    }
});
exports.createDonation = createDonation;
// Update donation
const updateDonation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, purpose, description, status, paymentId } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid donation ID'
            });
        }
        const donation = yield donation_model_1.default.findById(id);
        if (!donation) {
            res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        // Update fields
        const updatedDonation = yield donation_model_1.default.findByIdAndUpdate(id, {
            amount: amount || (donation === null || donation === void 0 ? void 0 : donation.amount),
            purpose: purpose || (donation === null || donation === void 0 ? void 0 : donation.purpose),
            description: description !== undefined ? description : donation === null || donation === void 0 ? void 0 : donation.description,
            status: status || (donation === null || donation === void 0 ? void 0 : donation.status),
            paymentId: paymentId || (donation === null || donation === void 0 ? void 0 : donation.paymentId)
        }, { new: true });
        res.status(200).json({
            success: true,
            message: 'Donation updated successfully',
            data: updatedDonation
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating donation',
            error: error.message
        });
    }
});
exports.updateDonation = updateDonation;
// Delete donation
const deleteDonation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid donation ID'
            });
        }
        const donation = yield donation_model_1.default.findById(id);
        if (!donation) {
            res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        yield donation_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Donation deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting donation',
            error: error.message
        });
    }
});
exports.deleteDonation = deleteDonation;
