import mongoose, { Schema } from 'mongoose';
import { IPledge, PaymentStatus } from '../types';

const pledgeSchema = new Schema<IPledge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    pledgeDate: {
      type: Date,
      default: Date.now,
    },
    fulfillmentDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPledge>('Pledge', pledgeSchema);
