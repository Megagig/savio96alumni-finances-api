import { Request, Response, NextFunction } from 'express';
import * as dueService from '../services/due.service';
import { sendSuccess } from '../utils/response.utils';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '../types';

/**
 * Create a new due
 * @route POST /api/dues
 * @access Private (Admin only)
 */
export const createDue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dueData = req.body;
    const due = await dueService.createDue(dueData);
    
    sendSuccess(res, 201, 'Due created successfully', { due });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all dues
 * @route GET /api/dues
 * @access Private (Admin only)
 */
export const getAllDues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dues = await dueService.getAllDues();
    
    sendSuccess(res, 200, 'Dues retrieved successfully', { dues });
  } catch (error) {
    next(error);
  }
};

/**
 * Get due by ID
 * @route GET /api/dues/:id
 * @access Private (Admin only)
 */
export const getDueById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const due = await dueService.getDueById(id);
    
    sendSuccess(res, 200, 'Due retrieved successfully', { due });
  } catch (error) {
    next(error);
  }
};

/**
 * Update due
 * @route PUT /api/dues/:id
 * @access Private (Admin only)
 */
export const updateDue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const due = await dueService.updateDue(id, updateData);
    
    sendSuccess(res, 200, 'Due updated successfully', { due });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete due
 * @route DELETE /api/dues/:id
 * @access Private (Admin only)
 */
export const deleteDue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await dueService.deleteDue(id);
    
    sendSuccess(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all member dues
 * @route GET /api/dues/members
 * @access Private (Admin only)
 */
export const getAllMemberDues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberDues = await dueService.getAllMemberDues();
    
    sendSuccess(res, 200, 'Member dues retrieved successfully', { memberDues });
  } catch (error) {
    next(error);
  }
};

/**
 * Get member dues by user ID
 * @route GET /api/dues/members/user/:userId
 * @access Private (Admin or own user)
 */
export const getMemberDuesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    
    // Check if user is requesting their own dues or has an admin role
    const adminRoles = [UserRole.ADMIN, UserRole.ADMIN_LEVEL_1, UserRole.ADMIN_LEVEL_2, UserRole.SUPER_ADMIN];
    if (!adminRoles.includes(req.user.role as UserRole) && req.user._id.toString() !== userId) {
      throw new AppError('Not authorized to access these dues', 403);
    }
    
    const memberDues = await dueService.getMemberDuesByUserId(userId);
    
    sendSuccess(res, 200, 'Member dues retrieved successfully', { memberDues });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's dues
 * @route GET /api/dues/members/my-dues
 * @access Private
 */
export const getMyDues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const memberDues = await dueService.getMemberDuesByUserId(req.user._id);
    
    sendSuccess(res, 200, 'Member dues retrieved successfully', { memberDues });
  } catch (error) {
    next(error);
  }
};

/**
 * Get member due by ID
 * @route GET /api/dues/members/:id
 * @access Private (Admin or due owner)
 */
export const getMemberDueById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const memberDue = await dueService.getMemberDueById(id);
    
    // Check if user is the due owner or is admin
    if (
      req.user.role !== 'admin' &&
      (memberDue.user as any)._id.toString() !== req.user._id.toString()
    ) {
      throw new AppError('Not authorized to access this due', 403);
    }
    
    sendSuccess(res, 200, 'Member due retrieved successfully', { memberDue });
  } catch (error) {
    next(error);
  }
};

/**
 * Update member due
 * @route PUT /api/dues/members/:id
 * @access Private (Admin only)
 */
export const updateMemberDue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const memberDue = await dueService.updateMemberDue(id, updateData);
    
    sendSuccess(res, 200, 'Member due updated successfully', { memberDue });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unpaid dues for the current user
 * @route GET /api/dues/unpaid
 * @access Private
 */
export const getUnpaidDues = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user's dues
    const memberDues = await dueService.getMemberDuesByUserId(req.user._id);
    
    // Filter to only include unpaid dues (status is PENDING)
    const unpaidDues = memberDues.filter(due => due.status === 'pending');
    
    sendSuccess(res, 200, 'Unpaid dues retrieved successfully', { unpaidDues });
  } catch (error) {
    next(error);
  }
};
