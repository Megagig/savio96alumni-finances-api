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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_model_1 = __importDefault(require("../models/user.model"));
const types_1 = require("../types");
// Load environment variables
dotenv_1.default.config();
// Connect to MongoDB
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conn = yield mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-hub');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1);
    }
});
// Seed Super Admin user
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First, make sure we have the correct UserRole values
        console.log('Available UserRoles:', Object.values(types_1.UserRole));
        // Check if a Super Admin already exists
        const existingSuperAdmin = yield user_model_1.default.findOne({ role: types_1.UserRole.SUPER_ADMIN });
        if (existingSuperAdmin) {
            console.log('Super Admin already exists:', existingSuperAdmin.email);
            return;
        }
        // Default Super Admin credentials (for development only)
        const superAdminData = {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'superadmin@example.com',
            password: 'SuperAdmin123!', // This should be changed in production
            role: types_1.UserRole.SUPER_ADMIN,
            isEmailVerified: true, // Set to true for development
            phoneNumber: '1234567890',
            membershipId: 'SUPER001',
            dateJoined: new Date(),
            isActive: true
        };
        // Create the Super Admin user with plain password
        // The password will be hashed by the pre-save hook in the user model
        const superAdmin = new user_model_1.default(superAdminData);
        yield superAdmin.save();
        console.log('Super Admin created successfully:', superAdmin.email);
    }
    catch (error) {
        console.error('Error seeding Super Admin:', error);
    }
});
// Create Admin Level 1 and Admin Level 2 users for testing
const seedAdminUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if Admin Level 1 already exists
        const existingAdminLevel1 = yield user_model_1.default.findOne({ role: types_1.UserRole.ADMIN_LEVEL_1 });
        if (!existingAdminLevel1) {
            // Default Admin Level 1 credentials
            const adminLevel1Data = {
                firstName: 'Admin',
                lastName: 'Level1',
                email: 'admin1@example.com',
                password: 'AdminLevel1!', // This should be changed in production
                role: types_1.UserRole.ADMIN_LEVEL_1,
                isEmailVerified: true, // Set to true for development
                phoneNumber: '1234567891',
                membershipId: 'ADMIN001',
                dateJoined: new Date(),
                isActive: true
            };
            // Create the Admin Level 1 user with plain password
            // The password will be hashed by the pre-save hook in the user model
            const adminLevel1 = new user_model_1.default(adminLevel1Data);
            yield adminLevel1.save();
            console.log('Admin Level 1 created successfully:', adminLevel1.email);
        }
        else {
            console.log('Admin Level 1 already exists:', existingAdminLevel1.email);
        }
        // Check if Admin Level 2 already exists
        const existingAdminLevel2 = yield user_model_1.default.findOne({ role: types_1.UserRole.ADMIN_LEVEL_2 });
        if (!existingAdminLevel2) {
            // Default Admin Level 2 credentials
            const adminLevel2Data = {
                firstName: 'Admin',
                lastName: 'Level2',
                email: 'admin2@example.com',
                password: 'AdminLevel2!', // This should be changed in production
                role: types_1.UserRole.ADMIN_LEVEL_2,
                isEmailVerified: true, // Set to true for development
                phoneNumber: '1234567892',
                membershipId: 'ADMIN002',
                dateJoined: new Date(),
                isActive: true
            };
            // Create the Admin Level 2 user with plain password
            // The password will be hashed by the pre-save hook in the user model
            const adminLevel2 = new user_model_1.default(adminLevel2Data);
            yield adminLevel2.save();
            console.log('Admin Level 2 created successfully:', adminLevel2.email);
        }
        else {
            console.log('Admin Level 2 already exists:', existingAdminLevel2.email);
        }
    }
    catch (error) {
        console.error('Error seeding Admin users:', error);
    }
});
// Main function
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield connectDB();
    yield seedSuperAdmin();
    yield seedAdminUsers();
    yield mongoose_1.default.disconnect();
    console.log('Database seeding completed');
});
// Run the script
main().catch(console.error);
