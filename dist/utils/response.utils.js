"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 * Send success response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param message Success message
 * @param data Response data
 */
const sendSuccess = (res, statusCode, message, data) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
/**
 * Send error response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param message Error message
 * @param errors Additional error details
 */
const sendError = (res, statusCode, message, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.sendError = sendError;
