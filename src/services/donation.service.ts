import Donation from '../models/donation.model';
import User from '../models/user.model';
import { IDonation, PaymentStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

/**
 * Create a new donation
 * @param donationData Donation data
 * @returns Created donation
 */
export const createDonation = async (donationData: Partial<IDonation>) => {
  // Verify user exists
  const userExists = await User.findById(donationData.user);
  if (!userExists) {
    throw new AppError('User not found', 404);
  }

  // Create donation
  const donation = await Donation.create(donationData);
  return donation;
};

/**
 * Get all donations
 * @returns List of all donations
 */
export const getAllDonations = async () => {
  const donations = await Donation.find()
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return donations;
};

/**
 * Get donations by user ID
 * @param userId User ID
 * @returns List of user's donations
 */
export const getDonationsByUserId = async (userId: string) => {
  const donations = await Donation.find({ user: userId })
    .populate('paymentId')
    .sort({ createdAt: -1 });
  return donations;
};

/**
 * Get donation by ID
 * @param donationId Donation ID
 * @returns Donation object
 */
export const getDonationById = async (donationId: string) => {
  const donation = await Donation.findById(donationId)
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId');
  
  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  return donation;
};

/**
 * Update donation
 * @param donationId Donation ID
 * @param updateData Updated donation data
 * @returns Updated donation
 */
export const updateDonation = async (
  donationId: string,
  updateData: Partial<IDonation>
) => {
  const donation = await Donation.findByIdAndUpdate(
    donationId,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId');

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  return donation;
};

/**
 * Delete donation
 * @param donationId Donation ID
 * @returns Success message
 */
export const deleteDonation = async (donationId: string) => {
  const donation = await Donation.findById(donationId);
  
  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  await Donation.findByIdAndDelete(donationId);

  return { message: 'Donation deleted successfully' };
};

/**
 * Process donation with payment
 * @param donationId Donation ID
 * @param paymentId Payment ID
 * @returns Updated donation
 */
export const processDonation = async (donationId: string, paymentId: string) => {
  const donation = await Donation.findByIdAndUpdate(
    donationId,
    {
      status: PaymentStatus.APPROVED,
      paymentId,
    },
    { new: true, runValidators: true }
  )
    .populate('user', 'firstName lastName email membershipId')
    .populate('paymentId');

  if (!donation) {
    throw new AppError('Donation not found', 404);
  }

  return donation;
};
