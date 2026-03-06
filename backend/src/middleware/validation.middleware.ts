/**
 * Request Validation Middleware
 * Validates student input data
 */

import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.util';

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate contact number format
 */
const isValidContact = (contact: string): boolean => {
  const contactRegex = /^\+?[\d\s-]{10,15}$/;
  return contactRegex.test(contact);
};

/**
 * Validate gender
 */
const isValidGender = (gender: string): boolean => {
  return ['male', 'female', 'other'].includes(gender.toLowerCase());
};

/**
 * Validate student creation/update data
 */
export const validateStudent = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, contact, gender } = req.body;
  const errors: string[] = [];

  // For POST requests, all fields are required
  if (req.method === 'POST') {
    if (!firstName || firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (!lastName || lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    if (!email || !isValidEmail(email)) {
      errors.push('Valid email is required');
    }
    if (!contact || !isValidContact(contact)) {
      errors.push('Valid contact number is required (10-15 digits)');
    }
    if (!gender || !isValidGender(gender)) {
      errors.push('Gender must be male, female, or other');
    }
  }

  // For PUT requests, validate only provided fields
  if (req.method === 'PUT') {
    if (firstName !== undefined && firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (lastName !== undefined && lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    if (email !== undefined && !isValidEmail(email)) {
      errors.push('Invalid email format');
    }
    if (contact !== undefined && !isValidContact(contact)) {
      errors.push('Invalid contact number format');
    }
    if (gender !== undefined && !isValidGender(gender)) {
      errors.push('Gender must be male, female, or other');
    }
  }

  if (errors.length > 0) {
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  next();
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!objectIdRegex.test(id)) {
    errorResponse(res, 'Invalid student ID format', 400);
    return;
  }

  next();
};
