import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import paymentRoutes from './routes/payment.routes';
import dueRoutes from './routes/due.routes';
import pledgeRoutes from './routes/pledge.routes';
import donationRoutes from './routes/donation.routes';
import levyRoutes from './routes/levy.routes';
import loanRoutes from './routes/loan.routes';
import accountingRoutes from './routes/accounting.routes';
import transactionRoutes from './routes/transaction.routes';
import reportRoutes from './routes/report.routes';

// Load environment variables
dotenv.config();

// Initialize express app
const app: Application = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration
const developmentOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const productionOrigins = [
  'http://finance.savio96alumni.com.ng',
  'https://finance.savio96alumni.com.ng',
  'http://api.savio96alumni.com.ng',
  'https://api.savio96alumni.com.ng',
];

const allowedOrigins =
  NODE_ENV === 'production' ? productionOrigins : developmentOrigins;

app.use(
  cors({
    origin: function (origin, callback) {
      // For development debugging
      console.log(`Request origin: ${origin}, Environment: ${NODE_ENV}`);

      // Allow requests with no origin (like mobile apps, Postman, or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Cache preflight response for 24 hours
  })
);

// Handle preflight requests - place after the regular CORS middleware
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded receipts
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dues', dueRoutes);
app.use('/api/pledges', pledgeRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/levies', levyRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
