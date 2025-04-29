import mongoose, { Schema } from 'mongoose';
import { ILoanRepayment, PaymentStatus } from '../types';

const loanRepaymentSchema = new Schema<ILoanRepayment>(
  {
    loan: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan is required'],
    },
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
    repaymentDate: {
      type: Date,
      default: Date.now,
    },
    receiptUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILoanRepayment>('LoanRepayment', loanRepaymentSchema);
