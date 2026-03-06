/**
 * Response Utility
 * Standardized response format for all API endpoints
 * Follows industry best practices
 */

import { Response } from 'express';

/**
 * Success response
 * @param res - Express response object
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 */
export const successResponse = (
  res: Response,
  data: any = null,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error response
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param details - Additional error details
 */
export const errorResponse = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  details?: any
): void => {
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
};

/**
 * Paginated response
 * @param res - Express response object
 * @param data - Response data array
 * @param pagination - Pagination metadata
 * @param message - Success message
 */
export const paginatedResponse = (
  res: Response,
  data: any[],
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  },
  message: string = 'Success'
): void => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};
