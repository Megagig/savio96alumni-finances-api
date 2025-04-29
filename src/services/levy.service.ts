import Levy from '../models/levy.model';
import MemberLevy from '../models/memberLevy.model';
import User from '../models/user.model';
import { ILevy, IMemberLevy, PaymentStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new levy
 * @param levyData Levy data
 * @returns Created levy
 */
export const createLevy = async (levyData: Partial<ILevy>) => {
  const levy = await Levy.create(levyData);
  
  // Assign this levy to all active members
  const activeMembers = await User.find({ isActive: true, role: 'member' });
  
  const memberLevies = activeMembers.map(member => ({
    user: member._id,
    levy: levy._id,
    amountPaid: 0,
    balance: levyData.amount as number,
    status: PaymentStatus.PENDING,
  }));
  
  if (memberLevies.length > 0) {
    await MemberLevy.insertMany(memberLevies);
  }
  
  return levy;
};

/**
 * Get all levies
 * @returns List of all levies
 */
export const getAllLevies = async () => {
  const levies = await Levy.find().sort({ startDate: -1 });
  return levies;
};

/**
 * Get levy by ID
 * @param levyId Levy ID
 * @returns Levy object
 */
export const getLevyById = async (levyId: string) => {
  const levy = await Levy.findById(levyId);
  
  if (!levy) {
    throw new AppError('Levy not found', 404);
  }

  return levy;
};

/**
 * Update levy
 * @param levyId Levy ID
 * @param updateData Updated levy data
 * @returns Updated levy
 */
export const updateLevy = async (
  levyId: string,
  updateData: Partial<ILevy>
) => {
  const levy = await Levy.findByIdAndUpdate(
    levyId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!levy) {
    throw new AppError('Levy not found', 404);
  }

  return levy;
};

/**
 * Delete levy
 * @param levyId Levy ID
 * @returns Success message
 */
export const deleteLevy = async (levyId: string) => {
  const levy = await Levy.findById(levyId);
  
  if (!levy) {
    throw new AppError('Levy not found', 404);
  }

  // Delete all member levies associated with this levy
  await MemberLevy.deleteMany({ levy: levyId });
  
  // Delete the levy
  await Levy.findByIdAndDelete(levyId);

  return { message: 'Levy deleted successfully' };
};

/**
 * Get all member levies
 * @returns List of all member levies
 */
export const getAllMemberLevies = async () => {
  const memberLevies = await MemberLevy.find()
    .populate('user', 'firstName lastName email membershipId')
    .populate('levy', 'title amount startDate')
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return memberLevies;
};

/**
 * Get member levies by user ID
 * @param userId User ID
 * @returns List of user's levies
 */
export const getMemberLeviesByUserId = async (userId: string) => {
  const memberLevies = await MemberLevy.find({ user: userId })
    .populate('levy', 'title amount startDate description')
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return memberLevies;
};

/**
 * Get member levy by ID
 * @param memberLevyId Member levy ID
 * @returns Member levy object
 */
export const getMemberLevyById = async (memberLevyId: string) => {
  const memberLevy = await MemberLevy.findById(memberLevyId)
    .populate('user', 'firstName lastName email membershipId')
    .populate('levy', 'title amount startDate description')
    .populate('paymentId');
  
  if (!memberLevy) {
    throw new AppError('Member levy not found', 404);
  }

  return memberLevy;
};

/**
 * Update member levy
 * @param memberLevyId Member levy ID
 * @param updateData Updated member levy data
 * @returns Updated member levy
 */
export const updateMemberLevy = async (
  memberLevyId: string,
  updateData: Partial<IMemberLevy>
) => {
  const memberLevy = await MemberLevy.findByIdAndUpdate(
    memberLevyId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('user', 'firstName lastName email membershipId')
    .populate('levy', 'title amount startDate description')
    .populate('paymentId');

  if (!memberLevy) {
    throw new AppError('Member levy not found', 404);
  }

  return memberLevy;
};
