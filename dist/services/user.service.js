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
exports.getNotificationSettings = exports.updateNotificationSettings = exports.getMembers = exports.changePassword = exports.setUserActiveStatus = exports.updateUserRole = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = exports.getUserByEmail = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
const error_middleware_1 = require("../middleware/error.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Get user by email
 * @param email User email
 * @returns User object or null if not found
 */
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ email });
    return user;
});
exports.getUserByEmail = getUserByEmail;
/**
 * Create a new user
 * @param userData User data
 * @returns Created user
 */
const createUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    // Generate a unique membership ID if not provided
    if (!userData.membershipId) {
        const count = yield user_model_1.default.countDocuments();
        userData.membershipId = `MEM${(count + 1).toString().padStart(4, '0')}`;
    }
    // Create new user
    const user = new user_model_1.default(userData);
    yield user.save();
    // Return user without password
    const userObject = user.toObject();
    const userWithoutPassword = Object.assign({}, userObject);
    if ('password' in userWithoutPassword) {
        delete userWithoutPassword.password;
    }
    return userWithoutPassword;
});
exports.createUser = createUser;
/**
 * Get all users
 * @returns List of all users
 */
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find().sort({ createdAt: -1 });
    return users;
});
exports.getAllUsers = getAllUsers;
/**
 * Get user by ID
 * @param userId User ID
 * @returns User object
 */
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    return user;
});
exports.getUserById = getUserById;
/**
 * Update user
 * @param userId User ID
 * @param updateData Updated user data
 * @returns Updated user
 */
const updateUser = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate user exists
        const userExists = yield user_model_1.default.findById(userId);
        if (!userExists) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        // Create a safe copy of update data without sensitive fields
        const safeUpdateData = {};
        // Only copy allowed fields
        if (updateData.firstName !== undefined)
            safeUpdateData.firstName = updateData.firstName;
        if (updateData.lastName !== undefined)
            safeUpdateData.lastName = updateData.lastName;
        if (updateData.phoneNumber !== undefined)
            safeUpdateData.phoneNumber = updateData.phoneNumber;
        if (updateData.address !== undefined)
            safeUpdateData.address = updateData.address;
        if (updateData.membershipId !== undefined)
            safeUpdateData.membershipId = updateData.membershipId;
        // Explicitly exclude sensitive fields
        // role, password, and email verification fields are not copied
        // Validate fields before updating
        if (safeUpdateData.firstName !== undefined && (!safeUpdateData.firstName || typeof safeUpdateData.firstName !== 'string')) {
            throw new error_middleware_1.AppError('First name must be a non-empty string', 400);
        }
        if (safeUpdateData.lastName !== undefined && (!safeUpdateData.lastName || typeof safeUpdateData.lastName !== 'string')) {
            throw new error_middleware_1.AppError('Last name must be a non-empty string', 400);
        }
        if (safeUpdateData.phoneNumber !== undefined && (!safeUpdateData.phoneNumber || typeof safeUpdateData.phoneNumber !== 'string')) {
            throw new error_middleware_1.AppError('Phone number must be a non-empty string', 400);
        }
        // If no valid fields to update, return the existing user
        if (Object.keys(safeUpdateData).length === 0) {
            return userExists;
        }
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { $set: safeUpdateData }, { new: true, runValidators: true });
        // Remove sensitive fields from the response
        const userObject = user === null || user === void 0 ? void 0 : user.toObject();
        if (userObject) {
            const sanitizedUser = Object.assign({}, userObject);
            // Use type assertion to handle optional properties
            if ('password' in sanitizedUser) {
                delete sanitizedUser.password;
            }
            if ('resetPasswordToken' in sanitizedUser) {
                delete sanitizedUser.resetPasswordToken;
            }
            if ('resetPasswordExpires' in sanitizedUser) {
                delete sanitizedUser.resetPasswordExpires;
            }
            if ('emailVerificationToken' in sanitizedUser) {
                delete sanitizedUser.emailVerificationToken;
            }
            if ('emailVerificationExpires' in sanitizedUser) {
                delete sanitizedUser.emailVerificationExpires;
            }
            return sanitizedUser;
        }
        return user;
    }
    catch (error) {
        // Log the error for debugging
        console.error('Error in updateUser service:', error);
        if (error instanceof error_middleware_1.AppError) {
            throw error;
        }
        if (error.name === 'ValidationError') {
            throw new error_middleware_1.AppError(`Validation error: ${error.message}`, 400);
        }
        throw new error_middleware_1.AppError('Failed to update profile. Please try again.', 500);
    }
});
exports.updateUser = updateUser;
/**
 * Update user role (admin only)
 * @param userId User ID
 * @param role New role
 * @returns Updated user
 */
const updateUserRole = (userId, role) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate role value
        if (!Object.values(types_1.UserRole).includes(role)) {
            throw new error_middleware_1.AppError(`Invalid role value. Must be one of: ${Object.values(types_1.UserRole).join(', ')}`, 400);
        }
        // Check if user exists before updating
        const userExists = yield user_model_1.default.findById(userId);
        if (!userExists) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        // Update user role
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
        if (!user) {
            throw new error_middleware_1.AppError('Failed to update user role', 500);
        }
        console.log(`User ${userId} role updated to ${role}`);
        return user;
    }
    catch (error) {
        console.error('Error updating user role:', error);
        throw error instanceof error_middleware_1.AppError ? error : new error_middleware_1.AppError(error.message || 'Failed to update user role', 500);
    }
});
exports.updateUserRole = updateUserRole;
/**
 * Activate or deactivate user
 * @param userId User ID
 * @param isActive Active status
 * @returns Updated user
 */
const setUserActiveStatus = (userId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findByIdAndUpdate(userId, { isActive }, { new: true });
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    return user;
});
exports.setUserActiveStatus = setUserActiveStatus;
/**
 * Change user password
 * @param userId User ID
 * @param currentPassword Current password
 * @param newPassword New password
 * @returns Success message
 */
const changePassword = (userId, currentPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user by ID with password
        const user = yield user_model_1.default.findById(userId).select('+password');
        if (!user) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        // Check if current password is correct
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new error_middleware_1.AppError('Current password is incorrect', 401);
        }
        // Hash the new password
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
        // Update password
        yield user_model_1.default.findByIdAndUpdate(userId, { password: hashedPassword });
        return { message: 'Password updated successfully' };
    }
    catch (error) {
        // Log the error for debugging
        console.error('Error in changePassword service:', error);
        // Re-throw AppErrors as they are already formatted properly
        if (error instanceof error_middleware_1.AppError) {
            throw error;
        }
        // Handle other types of errors
        throw new error_middleware_1.AppError('Failed to update password. Please try again.', 500);
    }
});
exports.changePassword = changePassword;
/**
 * Get members (users with role 'member')
 * @param page Page number
 * @param limit Items per page
 * @param search Search term
 * @returns List of members with pagination
 */
const getMembers = (page, limit, search) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (page - 1) * limit;
    // Build search query
    const searchQuery = search
        ? {
            role: types_1.UserRole.MEMBER,
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { membershipId: { $regex: search, $options: 'i' } }
            ]
        }
        : { role: types_1.UserRole.MEMBER };
    // Get total count for pagination
    const total = yield user_model_1.default.countDocuments(searchQuery);
    // Get members with pagination
    const members = yield user_model_1.default.find(searchQuery)
        .select('-password') // Exclude password field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    return {
        members,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
});
exports.getMembers = getMembers;
/**
 * Update notification settings for a user
 * @param userId User ID
 * @param notificationSettings Notification settings object
 * @returns Updated notification settings
 */
const updateNotificationSettings = (userId, notificationSettings) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the user exists first
        const userExists = yield user_model_1.default.findById(userId);
        if (!userExists) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        // Validate notification settings object
        const validatedSettings = {
            emailNotifications: typeof notificationSettings.emailNotifications === 'boolean' ? notificationSettings.emailNotifications : true,
            smsNotifications: typeof notificationSettings.smsNotifications === 'boolean' ? notificationSettings.smsNotifications : false,
            dueReminders: typeof notificationSettings.dueReminders === 'boolean' ? notificationSettings.dueReminders : true,
            paymentConfirmations: typeof notificationSettings.paymentConfirmations === 'boolean' ? notificationSettings.paymentConfirmations : true,
            loanUpdates: typeof notificationSettings.loanUpdates === 'boolean' ? notificationSettings.loanUpdates : true
        };
        // Update only the notification settings
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { $set: { notificationSettings: validatedSettings } }, { new: true });
        return (user === null || user === void 0 ? void 0 : user.notificationSettings) || {};
    }
    catch (error) {
        // Log the error for debugging
        console.error('Error in updateNotificationSettings service:', error);
        // Re-throw AppErrors as they are already formatted properly
        if (error instanceof error_middleware_1.AppError) {
            throw error;
        }
        // Handle other types of errors
        throw new error_middleware_1.AppError('Failed to update notification settings. Please try again.', 500);
    }
});
exports.updateNotificationSettings = updateNotificationSettings;
/**
 * Get notification settings for a user
 * @param userId User ID
 * @returns User's notification settings
 */
const getNotificationSettings = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new error_middleware_1.AppError('User not found', 404);
    }
    // Return default settings if not set
    return user.notificationSettings || {
        emailNotifications: true,
        smsNotifications: false,
        dueReminders: true,
        paymentConfirmations: true,
        loanUpdates: true
    };
});
exports.getNotificationSettings = getNotificationSettings;
