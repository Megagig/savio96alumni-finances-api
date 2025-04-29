import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-hub'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

// Seed Super Admin user
const seedSuperAdmin = async () => {
  try {
    // First, make sure we have the correct UserRole values
    console.log('Available UserRoles:', Object.values(UserRole));
    // Check if a Super Admin already exists
    const existingSuperAdmin = await User.findOne({
      role: UserRole.SUPER_ADMIN,
    });

    if (existingSuperAdmin) {
      console.log('Super Admin already exists:', existingSuperAdmin.email);
      return;
    }

    // Default Super Admin credentials (for development only)
    const superAdminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'Megagigdev@gmail.com',
      password: 'Allroundexploit@247', // This should be changed in production
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true, // Set to true for development
      phoneNumber: '08060374755',
      membershipId: 'SUPER001',
      dateJoined: new Date(),
      isActive: true,
    };

    // Create the Super Admin user with plain password
    // The password will be hashed by the pre-save hook in the user model
    const superAdmin = new User(superAdminData);

    await superAdmin.save();
    console.log('Super Admin created successfully:', superAdmin.email);
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  }
};

// Create Admin Level 1 and Admin Level 2 users for testing
const seedAdminUsers = async () => {
  try {
    // Check if Admin Level 1 already exists
    const existingAdminLevel1 = await User.findOne({
      role: UserRole.ADMIN_LEVEL_1,
    });

    if (!existingAdminLevel1) {
      // Default Admin Level 1 credentials
      const adminLevel1Data = {
        firstName: 'Admin',
        lastName: 'Level1',
        email: 'megagigsolution@gmail.com',
        password: 'AdminLevel1!', // This should be changed in production
        role: UserRole.ADMIN_LEVEL_1,
        isEmailVerified: true, // Set to true for development
        phoneNumber: '1234567891',
        membershipId: 'ADMIN001',
        dateJoined: new Date(),
        isActive: true,
      };

      // Create the Admin Level 1 user with plain password
      // The password will be hashed by the pre-save hook in the user model
      const adminLevel1 = new User(adminLevel1Data);

      await adminLevel1.save();
      console.log('Admin Level 1 created successfully:', adminLevel1.email);
    } else {
      console.log('Admin Level 1 already exists:', existingAdminLevel1.email);
    }

    // Check if Admin Level 2 already exists
    const existingAdminLevel2 = await User.findOne({
      role: UserRole.ADMIN_LEVEL_2,
    });

    if (!existingAdminLevel2) {
      // Default Admin Level 2 credentials
      const adminLevel2Data = {
        firstName: 'Admin',
        lastName: 'Level2',
        email: 'overcomersdigest@gmail.com',
        password: 'AdminLevel2!', // This should be changed in production
        role: UserRole.ADMIN_LEVEL_2,
        isEmailVerified: true, // Set to true for development
        phoneNumber: '1234567892',
        membershipId: 'ADMIN002',
        dateJoined: new Date(),
        isActive: true,
      };

      // Create the Admin Level 2 user with plain password
      // The password will be hashed by the pre-save hook in the user model
      const adminLevel2 = new User(adminLevel2Data);

      await adminLevel2.save();
      console.log('Admin Level 2 created successfully:', adminLevel2.email);
    } else {
      console.log('Admin Level 2 already exists:', existingAdminLevel2.email);
    }
  } catch (error) {
    console.error('Error seeding Admin users:', error);
  }
};

// Main function
const main = async () => {
  const conn = await connectDB();
  await seedSuperAdmin();
  await seedAdminUsers();
  await mongoose.disconnect();
  console.log('Database seeding completed');
};

// Run the script
main().catch(console.error);
