import { Request, Response, NextFunction } from 'express';
import Levy from '../models/levy.model';
import MemberLevy from '../models/memberLevy.model';
import User from '../models/user.model';
import { sendSuccess, sendError } from '../utils/response.utils';
import { PaymentStatus, UserRole } from '../types';

// Get all levies
export const getAllLevies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const levies = await Levy.find().sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Levies retrieved successfully', { levies });
  } catch (error) {
    next(error);
  }
};

// Get levy by ID
export const getLevyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const levy = await Levy.findById(id);
    
    if (!levy) {
      return sendError(res, 404, 'Levy not found');
    }
    
    sendSuccess(res, 200, 'Levy retrieved successfully', { levy });
  } catch (error) {
    next(error);
  }
};

// Create new levy
export const createLevy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, amount, description, startDate, endDate, isActive, assignToAll, selectedMembers } = req.body;
    
    // Create new levy
    const newLevy = new Levy({
      title,
      amount,
      description,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedLevy = await newLevy.save();
    
    // If assignToAll is true, create member levies for all active members
    if (assignToAll) {
      const activeMembers = await User.find({ 
        role: UserRole.MEMBER, 
        isActive: true 
      });
      
      const memberLevyPromises = activeMembers.map((member: any) => {
        const memberLevy = new MemberLevy({
          user: member._id,
          levy: savedLevy._id,
          amountPaid: 0,
          balance: amount,
          status: PaymentStatus.PENDING
        });
        
        return memberLevy.save();
      });
      
      await Promise.all(memberLevyPromises);
    } 
    // Otherwise, create member levies for selected members
    else if (selectedMembers && selectedMembers.length > 0) {
      const memberLevyPromises = selectedMembers.map((memberId: string) => {
        const memberLevy = new MemberLevy({
          user: memberId,
          levy: savedLevy._id,
          amountPaid: 0,
          balance: amount,
          status: PaymentStatus.PENDING
        });
        
        return memberLevy.save();
      });
      
      await Promise.all(memberLevyPromises);
    }
    
    sendSuccess(res, 201, 'Levy created successfully', { levy: savedLevy });
  } catch (error) {
    next(error);
  }
};

// Update levy
export const updateLevy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedLevy = await Levy.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedLevy) {
      return sendError(res, 404, 'Levy not found');
    }
    
    sendSuccess(res, 200, 'Levy updated successfully', { levy: updatedLevy });
  } catch (error) {
    next(error);
  }
};

// Delete levy
export const deleteLevy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const deletedLevy = await Levy.findByIdAndDelete(id);
    
    if (!deletedLevy) {
      return sendError(res, 404, 'Levy not found');
    }
    
    // Also delete all associated member levies
    await MemberLevy.deleteMany({ levy: id });
    
    sendSuccess(res, 200, 'Levy deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get all member levies
export const getAllMemberLevies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberLevies = await MemberLevy.find()
      .populate('user', 'firstName lastName email membershipId')
      .populate('levy', 'title amount startDate endDate')
      .sort({ createdAt: -1 });
    
    sendSuccess(res, 200, 'Member levies retrieved successfully', { memberLevies });
  } catch (error) {
    next(error);
  }
};

// Get member levy by ID
export const getMemberLevyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const memberLevy = await MemberLevy.findById(id)
      .populate('user', 'firstName lastName email membershipId')
      .populate('levy', 'title amount startDate endDate');
    
    if (!memberLevy) {
      return sendError(res, 404, 'Member levy not found');
    }
    
    sendSuccess(res, 200, 'Member levy retrieved successfully', { memberLevy });
  } catch (error) {
    next(error);
  }
};

// Get member levies by user ID
export const getMemberLeviesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own levies or has an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (!adminRoles.includes(req.user.role as UserRole) && req.user._id.toString() !== userId) {
      return sendError(res, 403, 'Not authorized to access these levies');
    }
    
    const memberLevies = await MemberLevy.find({ user: userId })
      .populate('levy', 'title amount startDate endDate')
      .sort({ createdAt: -1 });
    
    sendSuccess(res, 200, 'Member levies retrieved successfully', { memberLevies });
  } catch (error) {
    next(error);
  }
};

// Get current user's levies
export const getMyLevies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    
    const memberLevies = await MemberLevy.find({ user: userId })
      .populate('levy', 'title amount startDate endDate')
      .sort({ createdAt: -1 });
    
    sendSuccess(res, 200, 'Your levies retrieved successfully', { memberLevies });
  } catch (error) {
    next(error);
  }
};

// Update member levy
export const updateMemberLevy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedMemberLevy = await MemberLevy.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'firstName lastName email membershipId')
      .populate('levy', 'title amount startDate endDate');
    
    if (!updatedMemberLevy) {
      return sendError(res, 404, 'Member levy not found');
    }
    
    sendSuccess(res, 200, 'Member levy updated successfully', { memberLevy: updatedMemberLevy });
  } catch (error) {
    next(error);
  }
};
