import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin', // Legacy admin role - will be replaced by the new roles
  MEMBER = 'member',
  ADMIN_LEVEL_1 = 'admin_level_1',
  ADMIN_LEVEL_2 = 'admin_level_2',
  SUPER_ADMIN = 'super_admin'
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  DEFAULTED = 'defaulted'
}

export enum PaymentType {
  DUE = 'due',
  LEVY = 'levy',
  PLEDGE = 'pledge',
  DONATION = 'donation',
  LOAN_REPAYMENT = 'loan_repayment'
}

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  CREDIT = 'credit',
  DEBIT = 'debit'
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber: string;
  address?: string;
  membershipId?: string;
  dateJoined: Date;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    dueReminders: boolean;
    paymentConfirmations: boolean;
    loanUpdates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IPayment extends Document {
  user: IUser['_id'];
  amount: number;
  description: string;
  paymentDate: Date;
  receiptUrl?: string;
  status: PaymentStatus;
  approvedBy?: IUser['_id'];
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDue extends Document {
  name: string;
  amount: number;
  dueDate: Date;
  description?: string;
  isRecurring: boolean;
  frequency?: string; // monthly, quarterly, yearly
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberDue extends Document {
  user: IUser['_id'];
  due: IDue['_id'] | { name: string };
  amountPaid: number;
  balance: number;
  amount: number;
  dueDate?: Date;
  status: PaymentStatus;
  paymentId?: IPayment['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPledge extends Document {
  user: IUser['_id'];
  amount: number;
  title: string;
  description?: string;
  pledgeDate: Date;
  fulfillmentDate?: Date;
  status: PaymentStatus;
  paymentId?: IPayment['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonation extends Document {
  user: IUser['_id'];
  amount: number;
  purpose: string;
  description?: string;
  donationDate: Date;
  status: PaymentStatus;
  paymentId?: IPayment['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILevy extends Document {
  title: string;
  amount: number;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemberLevy extends Document {
  user: IUser['_id'];
  levy: ILevy['_id'] | { title: string };
  amountPaid: number;
  balance: number;
  amount: number;
  dueDate?: Date;
  status: PaymentStatus;
  paymentId?: IPayment['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoan extends Document {
  user: IUser['_id'];
  amount: number;
  purpose: string;
  applicationDate: Date;
  approvalDate?: Date;
  repaymentDate?: Date;
  interestRate: number;
  status: LoanStatus;
  approvedBy?: IUser['_id'];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanRepayment extends Document {
  loan: ILoan['_id'];
  user: IUser['_id'];
  amount: number;
  repaymentDate: Date;
  receiptUrl?: string;
  status: PaymentStatus;
  approvedBy?: IUser['_id'];
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction extends Document {
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  date: Date;
  recordedBy: IUser['_id'];
  relatedPayment?: IPayment['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDecodedToken {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}
