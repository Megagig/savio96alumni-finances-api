import { Response } from 'express';

/**
 * Send success response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param message Success message
 * @param data Response data
 */
export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param message Error message
 * @param errors Additional error details
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
