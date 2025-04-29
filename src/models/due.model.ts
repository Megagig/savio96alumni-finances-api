import mongoose, { Schema } from 'mongoose';
import { IDue } from '../types';

const dueSchema = new Schema<IDue>(
  {
    name: {
      type: String,
      required: [true, 'Due name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    description: {
      type: String,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      required: function (this: IDue) {
        return this.isRecurring;
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDue>('Due', dueSchema);
