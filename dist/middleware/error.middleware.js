"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
// Custom error class
class AppError extends Error {
    constructor(message, statusCode, data) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.data = data;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Error handler middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `Duplicate field value: ${field}. Please use another value for ${field}.`;
        err = new AppError(message, 400);
    }
    // MongoDB validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((val) => val.message);
        const message = `Invalid input data. ${errors.join('. ')}`;
        err = new AppError(message, 400);
    }
    // MongoDB cast error
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}`;
        err = new AppError(message, 400);
    }
    // JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        err = new AppError(message, 401);
    }
    // JWT expired error
    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again.';
        err = new AppError(message, 401);
    }
    // Send error response
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        data: err.data,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
