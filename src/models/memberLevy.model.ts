import mongoose, { Schema } from 'mongoose';
import { IMemberLevy, PaymentStatus } from '../types';

const memberLevySchema = new Schema<IMemberLevy>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    levy: {
      type: Schema.Types.ObjectId,
      ref: 'Levy',
      required: [true, 'Levy is required'],
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

export default mongoose.model<IMemberLevy>('MemberLevy', memberLevySchema);
