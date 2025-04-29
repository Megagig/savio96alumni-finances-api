import Pledge from '../models/pledge.model';
import User from '../models/user.model';
import { IPledge, PaymentStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new pledge
 * @param pledgeData Pledge data
 * @returns Created pledge
 */
export const createPledge = async (pledgeData: Partial<IPledge>) => {
  // Verify user exists
  const userExists = await User.findById(pledgeData.user);
  if (!userExists) {
    throw new AppError('User not found', 404);
  }

  // Create pledge
  const pledge = await Pledge.create(pledgeData);
  return pledge;
};

/**
 * Get all pledges
 * @returns List of all pledges
 */
export const getAllPledges = async () => {
  const pledges = await Pledge.find()
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return pledges;
};

/**
 * Get pledges by user ID
 * @param userId User ID
 * @returns List of user's pledges
 */
export const getPledgesByUserId = async (userId: string) => {
  const pledges = await Pledge.find({ user: userId })
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return pledges;
};

/**
 * Get pledge by ID
 * @param pledgeId Pledge ID
 * @returns Pledge object
 */
export const getPledgeById = async (pledgeId: string) => {
  const pledge = await Pledge.findById(pledgeId)
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId');
  
  if (!pledge) {
    throw new AppError('Pledge not found', 404);
  }

  return pledge;
};

/**
 * Update pledge
 * @param pledgeId Pledge ID
 * @param updateData Updated pledge data
 * @returns Updated pledge
 */
export const updatePledge = async (
  pledgeId: string,
  updateData: Partial<IPledge>
) => {
  const pledge = await Pledge.findByIdAndUpdate(
    pledgeId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId');

  if (!pledge) {
    throw new AppError('Pledge not found', 404);
  }

  return pledge;
};

/**
 * Delete pledge
 * @param pledgeId Pledge ID
 * @returns Success message
 */
export const deletePledge = async (pledgeId: string) => {
  const pledge = await Pledge.findById(pledgeId);
  
  if (!pledge) {
    throw new AppError('Pledge not found', 404);
  }

  await Pledge.findByIdAndDelete(pledgeId);

  return { message: 'Pledge deleted successfully' };
};

/**
 * Fulfill pledge with payment
 * @param pledgeId Pledge ID
 * @param paymentId Payment ID
 * @returns Updated pledge
 */
export const fulfillPledge = async (pledgeId: string, paymentId: string) => {
  const pledge = await Pledge.findByIdAndUpdate(
    pledgeId,
    {
      status: PaymentStatus.APPROVED,
      paymentId,
      fulfillmentDate: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId');

  if (!pledge) {
    throw new AppError('Pledge not found', 404);
  }

  return pledge;
};
