import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';
import {
  getAllDonations,
  getDonationById,
  getDonationsByUser,
  createDonation,
  updateDonation,
  deleteDonation
} from '../controllers/donation.controller';

const router = Router();

// Get all donations (admin only)
router.get('/', authenticate, isAdmin, getAllDonations);

// Get user's donations
router.get('/my-donations', authenticate, getDonationsByUser);

// Get donation by ID
router.get('/:id', authenticate, getDonationById);

// Create new donation
router.post('/', authenticate, createDonation);

// Update donation (admin only)
router.put('/:id', authenticate, isAdmin, updateDonation);

// Delete donation (admin only)
router.delete('/:id', authenticate, isAdmin, deleteDonation);

export default router;
