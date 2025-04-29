import User from '../models/user.model';
import { IUser, UserRole } from '../types';
import { AppError } from '../middleware/error.middleware';
import bcrypt from 'bcryptjs';

/**
 * Get user by email
 * @param email User email
 * @returns User object or null if not found
 */
export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({ email });
  return user;
};

/**
 * Create a new user
 * @param userData User data
 * @returns Created user
 */
export const createUser = async (userData: Partial<IUser>) => {
  // Generate a unique membership ID if not provided
  if (!userData.membershipId) {
    const count = await User.countDocuments();
    userData.membershipId = `MEM${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Create new user
  const user = new User(userData);
  await user.save();
  
  // Return user without password
  const userObject = user.toObject();
  const userWithoutPassword = { ...userObject };
  if ('password' in userWithoutPassword) {
    delete (userWithoutPassword as any).password;
  }
  
  return userWithoutPassword;
};

/**
 * Get all users
 * @returns List of all users
 */
export const getAllUsers = async () => {
  const users = await User.find().sort({ createdAt: -1 });
  return users;
};

/**
 * Get user by ID
 * @param userId User ID
 * @returns User object
 */
export const getUserById = async (userId: string) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Update user
 * @param userId User ID
 * @param updateData Updated user data
 * @returns Updated user
 */
export const updateUser = async (userId: string, updateData: Partial<IUser>) => {
  try {
    // Validate user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new AppError('User not found', 404);
    }
    
    // Create a safe copy of update data without sensitive fields
    const safeUpdateData: Partial<IUser> = {};
    
    // Only copy allowed fields
    if (updateData.firstName !== undefined) safeUpdateData.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) safeUpdateData.lastName = updateData.lastName;
    if (updateData.phoneNumber !== undefined) safeUpdateData.phoneNumber = updateData.phoneNumber;
    if (updateData.address !== undefined) safeUpdateData.address = updateData.address;
    if (updateData.membershipId !== undefined) safeUpdateData.membershipId = updateData.membershipId;
    
    // Explicitly exclude sensitive fields
    // role, password, and email verification fields are not copied
    
    // Validate fields before updating
    if (safeUpdateData.firstName !== undefined && (!safeUpdateData.firstName || typeof safeUpdateData.firstName !== 'string')) {
      throw new AppError('First name must be a non-empty string', 400);
    }
    
    if (safeUpdateData.lastName !== undefined && (!safeUpdateData.lastName || typeof safeUpdateData.lastName !== 'string')) {
      throw new AppError('Last name must be a non-empty string', 400);
    }
    
    if (safeUpdateData.phoneNumber !== undefined && (!safeUpdateData.phoneNumber || typeof safeUpdateData.phoneNumber !== 'string')) {
      throw new AppError('Phone number must be a non-empty string', 400);
    }
    
    // If no valid fields to update, return the existing user
    if (Object.keys(safeUpdateData).length === 0) {
      return userExists;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    );

    // Remove sensitive fields from the response
    const userObject = user?.toObject();
    if (userObject) {
      const sanitizedUser = { ...userObject };
      // Use type assertion to handle optional properties
      if ('password' in sanitizedUser) {
        delete (sanitizedUser as any).password;
      }
      if ('resetPasswordToken' in sanitizedUser) {
        delete (sanitizedUser as any).resetPasswordToken;
      }
      if ('resetPasswordExpires' in sanitizedUser) {
        delete (sanitizedUser as any).resetPasswordExpires;
      }
      if ('emailVerificationToken' in sanitizedUser) {
        delete (sanitizedUser as any).emailVerificationToken;
      }
      if ('emailVerificationExpires' in sanitizedUser) {
        delete (sanitizedUser as any).emailVerificationExpires;
      }
      return sanitizedUser;
    }

    return user;
  } catch (error: any) {
    // Log the error for debugging
    console.error('Error in updateUser service:', error);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    if (error.name === 'ValidationError') {
      throw new AppError(`Validation error: ${error.message}`, 400);
    }
    
    throw new AppError('Failed to update profile. Please try again.', 500);
  }
};

/**
 * Update user role (admin only)
 * @param userId User ID
 * @param role New role
 * @returns Updated user
 */
export const updateUserRole = async (userId: string, role: string) => {
  try {
    // Validate role value
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new AppError(`Invalid role value. Must be one of: ${Object.values(UserRole).join(', ')}`, 400);
    }

    // Check if user exists before updating
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new AppError('User not found', 404);
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('Failed to update user role', 500);
    }

    console.log(`User ${userId} role updated to ${role}`);
    return user;
  } catch (error: any) {
    console.error('Error updating user role:', error);
    throw error instanceof AppError ? error : new AppError(error.message || 'Failed to update user role', 500);
  }
};

/**
 * Activate or deactivate user
 * @param userId User ID
 * @param isActive Active status
 * @returns Updated user
 */
export const setUserActiveStatus = async (userId: string, isActive: boolean) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Change user password
 * @param userId User ID
 * @param currentPassword Current password
 * @param newPassword New password
 * @returns Success message
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  try {
    // Find user by ID with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return { message: 'Password updated successfully' };
  } catch (error) {
    // Log the error for debugging
    console.error('Error in changePassword service:', error);
    
    // Re-throw AppErrors as they are already formatted properly
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle other types of errors
    throw new AppError('Failed to update password. Please try again.', 500);
  }
};

/**
 * Get members (users with role 'member')
 * @param page Page number
 * @param limit Items per page
 * @param search Search term
 * @returns List of members with pagination
 */
export const getMembers = async (page: number, limit: number, search: string) => {
  const skip = (page - 1) * limit;
  
  // Build search query
  const searchQuery = search
    ? {
        role: UserRole.MEMBER,
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
          { membershipId: { $regex: search, $options: 'i' } }
        ]
      }
    : { role: UserRole.MEMBER };
  
  // Get total count for pagination
  const total = await User.countDocuments(searchQuery);
  
  // Get members with pagination
  const members = await User.find(searchQuery)
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
};

/**
 * Update notification settings for a user
 * @param userId User ID
 * @param notificationSettings Notification settings object
 * @returns Updated notification settings
 */
export const updateNotificationSettings = async (userId: string, notificationSettings: any) => {
  try {
    // Validate the user exists first
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new AppError('User not found', 404);
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
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationSettings: validatedSettings } },
      { new: true }
    );
    
    return user?.notificationSettings || {};
  } catch (error) {
    // Log the error for debugging
    console.error('Error in updateNotificationSettings service:', error);
    
    // Re-throw AppErrors as they are already formatted properly
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle other types of errors
    throw new AppError('Failed to update notification settings. Please try again.', 500);
  }
};

/**
 * Get notification settings for a user
 * @param userId User ID
 * @returns User's notification settings
 */
export const getNotificationSettings = async (userId: string) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Return default settings if not set
  return user.notificationSettings || {
    emailNotifications: true,
    smsNotifications: false,
    dueReminders: true,
    paymentConfirmations: true,
    loanUpdates: true
  };
};
