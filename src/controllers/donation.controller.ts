import { Request, Response } from 'express';
import Donation from '../models/donation.model';
import { PaymentStatus } from '../types';
import mongoose from 'mongoose';

// Get all donations
export const getAllDonations = async (req: Request, res: Response) => {
  try {
    const donations = await Donation.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Donations retrieved successfully',
      data: donations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving donations',
      error: error.message
    });
  }
};

// Get donation by ID
export const getDonationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid donation ID'
      });
    }
    
    const donation = await Donation.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('paymentId');
    
    if (!donation) {
      res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Donation retrieved successfully',
      data: donation
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving donation',
      error: error.message
    });
  }
};

// Get donations by user ID
export const getDonationsByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const donations = await Donation.find({ user: userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'User donations retrieved successfully',
      data: donations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user donations',
      error: error.message
    });
  }
};

// Create new donation
export const createDonation = async (req: Request, res: Response) => {
  try {
    const { amount, purpose, description } = req.body;
    const userId = req.user?.id;
    
    // Validate input
    if (!amount || amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    if (!purpose) {
      res.status(400).json({
        success: false,
        message: 'Purpose is required'
      });
    }
    
    // Create donation
    const newDonation = await Donation.create({
      user: userId,
      amount,
      purpose,
      description,
      donationDate: new Date(),
      status: PaymentStatus.PENDING
    });
    
    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: newDonation
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating donation',
      error: error.message
    });
  }
};

// Update donation
export const updateDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, purpose, description, status, paymentId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid donation ID'
      });
    }
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    // Update fields
    const updatedDonation = await Donation.findByIdAndUpdate(
      id,
      {
        amount: amount || donation?.amount,
        purpose: purpose || donation?.purpose,
        description: description !== undefined ? description : donation?.description,
        status: status || donation?.status,
        paymentId: paymentId || donation?.paymentId
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: updatedDonation
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating donation',
      error: error.message
    });
  }
};

// Delete donation
export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid donation ID'
      });
    }
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    await Donation.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting donation',
      error: error.message
    });
  }
};
