import Due from '../models/due.model';
import MemberDue from '../models/memberDue.model';
import User from '../models/user.model';
import { IDue, IMemberDue, PaymentStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new due
 * @param dueData Due data with optional member selection
 * @returns Created due
 */
export const createDue = async (dueData: Partial<IDue> & { assignToAll?: boolean; selectedMembers?: string[] }) => {
  // Extract member selection data
  const { assignToAll, selectedMembers, ...dueFields } = dueData;
  
  // Create the due
  const due = await Due.create(dueFields);
  
  let memberDues: Array<Partial<IMemberDue>> = [];
  
  // If assignToAll is true or not specified, assign to all active members
  if (assignToAll === undefined || assignToAll === true) {
    const activeMembers = await User.find({ isActive: true, role: 'member' });
    
    memberDues = activeMembers.map(member => ({
      user: member._id,
      due: due._id,
      amountPaid: 0,
      balance: dueFields.amount as number,
      status: PaymentStatus.PENDING,
    }));
  } 
  // Otherwise, assign to selected members
  else if (selectedMembers && selectedMembers.length > 0) {
    memberDues = selectedMembers.map(memberId => ({
      user: memberId,
      due: due._id,
      amountPaid: 0,
      balance: dueFields.amount as number,
      status: PaymentStatus.PENDING,
    }));
  }
  
  if (memberDues.length > 0) {
    await MemberDue.insertMany(memberDues);
  }
  
  return due;
};

/**
 * Get all dues
 * @returns List of all dues
 */
export const getAllDues = async () => {
  const dues = await Due.find().sort({ dueDate: -1 });
  return dues;
};

/**
 * Get due by ID
 * @param dueId Due ID
 * @returns Due object
 */
export const getDueById = async (dueId: string) => {
  const due = await Due.findById(dueId);
  
  if (!due) {
    throw new AppError('Due not found', 404);
  }

  return due;
};

/**
 * Update due
 * @param dueId Due ID
 * @param updateData Updated due data
 * @returns Updated due
 */
export const updateDue = async (dueId: string, updateData: Partial<IDue>) => {
  const due = await Due.findByIdAndUpdate(
    dueId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!due) {
    throw new AppError('Due not found', 404);
  }

  return due;
};

/**
 * Delete due
 * @param dueId Due ID
 * @returns Success message
 */
export const deleteDue = async (dueId: string) => {
  const due = await Due.findById(dueId);
  
  if (!due) {
    throw new AppError('Due not found', 404);
  }

  // Delete all member dues associated with this due
  await MemberDue.deleteMany({ due: dueId });
  
  // Delete the due
  await Due.findByIdAndDelete(dueId);

  return { message: 'Due deleted successfully' };
};

/**
 * Get all member dues
 * @returns List of all member dues
 */
export const getAllMemberDues = async () => {
  const memberDues = await MemberDue.find()
    .populate('user', 'firstName lastName email membershipId')
    .populate('due', 'name amount dueDate')
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return memberDues;
};

/**
 * Get member dues by user ID
 * @param userId User ID
 * @returns List of user's dues
 */
export const getMemberDuesByUserId = async (userId: string) => {
  const memberDues = await MemberDue.find({ user: userId })
    .populate('due', 'name amount dueDate description')
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return memberDues;
};

/**
 * Get member due by ID
 * @param memberDueId Member due ID
 * @returns Member due object
 */
export const getMemberDueById = async (memberDueId: string) => {
  const memberDue = await MemberDue.findById(memberDueId)
    .populate('user', 'firstName lastName email membershipId')
    .populate('due', 'name amount dueDate description')
    .populate('paymentId');
  
  if (!memberDue) {
    throw new AppError('Member due not found', 404);
  }

  return memberDue;
};

/**
 * Update member due
 * @param memberDueId Member due ID
 * @param updateData Updated member due data
 * @returns Updated member due
 */
export const updateMemberDue = async (
  memberDueId: string,
  updateData: Partial<IMemberDue>
) => {
  const memberDue = await MemberDue.findByIdAndUpdate(
    memberDueId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('user', 'firstName lastName email membershipId')
    .populate('due', 'name amount dueDate description')
    .populate('paymentId');

  if (!memberDue) {
    throw new AppError('Member due not found', 404);
  }

  return memberDue;
};
