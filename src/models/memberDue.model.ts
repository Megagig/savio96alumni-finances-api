import mongoose, { Schema } from 'mongoose';
import { IMemberDue, PaymentStatus } from '../types';

const memberDueSchema = new Schema<IMemberDue>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    due: {
      type: Schema.Types.ObjectId,
      ref: 'Due',
      required: [true, 'Due is required'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
    },
    balance: {
      type: Number,
      required: [true, 'Balance is required'],
      min: [0, 'Balance cannot be negative'],
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

export default mongoose.model<IMemberDue>('MemberDue', memberDueSchema);
