import { Request, Response, NextFunction } from 'express';
import * as pledgeService from '../services/pledge.service';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '../types';

/**
 * Create a new pledge
 * @route POST /api/pledges
 * @access Private
 */
export const createPledge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pledgeData = {
      ...req.body,
      user: req.user.role === UserRole.ADMIN || req.user.role === UserRole.ADMIN_LEVEL_1 || req.user.role === UserRole.ADMIN_LEVEL_2 || req.user.role === UserRole.SUPER_ADMIN ? req.body.user : req.user._id,
    };
    
    const pledge = await pledgeService.createPledge(pledgeData);
    
    sendSuccess(res, 201, 'Pledge created successfully', { pledge });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all pledges
 * @route GET /api/pledges
 * @access Private (Admin only)
 */
export const getAllPledges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pledges = await pledgeService.getAllPledges();
    
    sendSuccess(res, 200, 'Pledges retrieved successfully', { pledges });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pledges by user ID
 * @route GET /api/pledges/user/:userId
 * @access Private (Admin or own user)
 */
export const getPledgesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own pledges or has an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (!adminRoles.includes(req.user.role as UserRole) && req.user._id.toString() !== userId) {
      throw new AppError('Not authorized to access these pledges', 403);
    }
    
    const pledges = await pledgeService.getPledgesByUserId(userId);
    
    sendSuccess(res, 200, 'Pledges retrieved successfully', { pledges });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's pledges
 * @route GET /api/pledges/my-pledges
 * @access Private
 */
export const getMyPledges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pledges = await pledgeService.getPledgesByUserId(req.user._id);
    
    sendSuccess(res, 200, 'Pledges retrieved successfully', { pledges });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pledge by ID
 * @route GET /api/pledges/:id
 * @access Private (Admin or pledge owner)
 */
export const getPledgeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const pledge = await pledgeService.getPledgeById(id);
    
    // Check if user is the pledge owner or has an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (
      !adminRoles.includes(req.user.role as UserRole) &&
      (pledge.user as any)._id.toString() !== req.user._id.toString()
    ) {
      throw new AppError('Not authorized to access this pledge', 403);
    }
    
    sendSuccess(res, 200, 'Pledge retrieved successfully', { pledge });
  } catch (error) {
    next(error);
  }
};

/**
 * Update pledge
 * @route PUT /api/pledges/:id
 * @access Private (Admin or pledge owner)
 */
export const updatePledge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Get pledge to check ownership
    const pledge = await pledgeService.getPledgeById(id);
    
    // Check if user is the pledge owner or has an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (
      !adminRoles.includes(req.user.role as UserRole) &&
      (pledge.user as any)._id.toString() !== req.user._id.toString()
    ) {
      throw new AppError('Not authorized to update this pledge', 403);
    }
    
    const updateData = req.body;
    
    const updatedPledge = await pledgeService.updatePledge(id, updateData);
    
    sendSuccess(res, 200, 'Pledge updated successfully', { pledge: updatedPledge });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete pledge
 * @route DELETE /api/pledges/:id
 * @access Private (Admin only)
 */
export const deletePledge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await pledgeService.deletePledge(id);
    
    sendSuccess(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Fulfill pledge with payment
 * @route PATCH /api/pledges/:id/fulfill
 * @access Private (Admin only)
 */
export const fulfillPledge = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { paymentId } = req.body;
    
    if (!paymentId) {
      throw new AppError('Payment ID is required', 400);
    }
    
    const pledge = await pledgeService.fulfillPledge(id, paymentId);
    
    sendSuccess(res, 200, 'Pledge fulfilled successfully', { pledge });
  } catch (error) {
    next(error);
  }
};
