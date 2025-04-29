"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const due_routes_1 = __importDefault(require("./routes/due.routes"));
const pledge_routes_1 = __importDefault(require("./routes/pledge.routes"));
const donation_routes_1 = __importDefault(require("./routes/donation.routes"));
const levy_routes_1 = __importDefault(require("./routes/levy.routes"));
const loan_routes_1 = __importDefault(require("./routes/loan.routes"));
const accounting_routes_1 = __importDefault(require("./routes/accounting.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
// Load environment variables
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Static files for uploaded receipts
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/dues', due_routes_1.default);
app.use('/api/pledges', pledge_routes_1.default);
app.use('/api/donations', donation_routes_1.default);
app.use('/api/levies', levy_routes_1.default);
app.use('/api/loans', loan_routes_1.default);
app.use('/api/accounting', accounting_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
app.use('/api/reports', report_routes_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    // Start the server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});
