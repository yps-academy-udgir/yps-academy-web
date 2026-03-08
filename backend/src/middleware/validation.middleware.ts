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
  return ['male', 'female'].includes(gender.toLowerCase());
};

/**
 * Validate class
 */
const isValidClass = (classValue: string): boolean => {
  return ['5th', '6th', '7th', '8th', '9th', '10th'].includes(classValue);
};

/**
 * Validate year of admission
 */
const isValidYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 10;
};

/**
 * Validate student creation/update data
 */
export const validateStudent = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, contact, gender, academicDetails } = req.body;
  const errors: string[] = [];

  // For POST requests, all basic fields are required
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
      errors.push('Gender must be male or female');
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
      errors.push('Gender must be male or female');
    }
  }

  // Validate academic details if provided
  if (academicDetails) {
    if (academicDetails.yearOfAdmission !== undefined) {
      if (!Number.isInteger(academicDetails.yearOfAdmission) || !isValidYear(academicDetails.yearOfAdmission)) {
        errors.push('Year of admission must be a valid year between 1900 and ' + (new Date().getFullYear() + 10));
      }
    }
    if (academicDetails.class !== undefined) {
      if (!isValidClass(academicDetails.class)) {
        errors.push('Class must be one of: 5th, 6th, 7th, 8th, 9th, 10th');
      }
    }
    if (academicDetails.subjects !== undefined) {
      if (!Array.isArray(academicDetails.subjects)) {
        errors.push('Subjects must be an array');
      } else if (academicDetails.subjects.length > 10) {
        errors.push('Cannot have more than 10 subjects');
      }
    }
    if (academicDetails.selfStudyMode !== undefined) {
      if (typeof academicDetails.selfStudyMode !== 'boolean') {
        errors.push('Self study mode must be a boolean value');
      }
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
    errorResponse(res, 'Invalid ID format', 400);
    return;
  }

  next();
};

/**
 * Validate faculty creation/update data
 */
export const validateFaculty = (req: Request, res: Response, next: NextFunction): void => {
  const { firstName, lastName, email, contact, department, speciality, degree, yearsOfExperience, annualSalary, pastExperience, salaryPayments } = req.body;
  const errors: string[] = [];

  const validDepartments = ['Mathematics', 'Science', 'English'];
  const validSpecialities = ['Mathematics', 'Science', 'English'];

  if (req.method === 'POST') {
    if (!firstName || firstName.trim().length < 2) errors.push('First name must be at least 2 characters');
    if (!lastName || lastName.trim().length < 2) errors.push('Last name must be at least 2 characters');
    if (!email || !isValidEmail(email)) errors.push('Valid email is required');
    if (!contact || !isValidContact(contact)) errors.push('Valid contact number is required (10-15 digits)');
    if (!department || !validDepartments.includes(department)) errors.push('Department must be one of: ' + validDepartments.join(', '));
    if (!speciality || !validSpecialities.includes(speciality)) errors.push('Speciality must be one of: ' + validSpecialities.join(', '));
    if (!degree || degree.trim().length < 2) errors.push('Degree / qualification is required');
    if (yearsOfExperience === undefined || yearsOfExperience === null || isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0) {
      errors.push('Years of experience must be a non-negative number');
    }
    if (annualSalary === undefined || annualSalary === null || isNaN(Number(annualSalary)) || Number(annualSalary) < 1) {
      errors.push('Annual salary must be greater than 0');
    }
  }

  if (req.method === 'PUT') {
    if (firstName !== undefined && firstName.trim().length < 2) errors.push('First name must be at least 2 characters');
    if (lastName !== undefined && lastName.trim().length < 2) errors.push('Last name must be at least 2 characters');
    if (email !== undefined && !isValidEmail(email)) errors.push('Invalid email format');
    if (contact !== undefined && !isValidContact(contact)) errors.push('Invalid contact number format');
    if (department !== undefined && !validDepartments.includes(department)) errors.push('Department must be one of: ' + validDepartments.join(', '));
    if (speciality !== undefined && !validSpecialities.includes(speciality)) errors.push('Speciality must be one of: ' + validSpecialities.join(', '));
    if (degree !== undefined && degree.trim().length < 2) errors.push('Degree / qualification is required');
    if (yearsOfExperience !== undefined && (isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0)) {
      errors.push('Years of experience must be a non-negative number');
    }
    if (annualSalary !== undefined && (isNaN(Number(annualSalary)) || Number(annualSalary) < 1)) {
      errors.push('Annual salary must be greater than 0');
    }
  }

  // Validate pastExperience array if provided
  if (pastExperience !== undefined) {
    if (!Array.isArray(pastExperience)) {
      errors.push('pastExperience must be an array');
    } else {
      pastExperience.forEach((exp: any, i: number) => {
        if (!exp.organization || exp.organization.trim().length < 1) errors.push(`pastExperience[${i}]: organization is required`);
        if (!exp.role || exp.role.trim().length < 1) errors.push(`pastExperience[${i}]: role is required`);
        if (exp.yearsOfExperience === undefined || isNaN(Number(exp.yearsOfExperience)) || Number(exp.yearsOfExperience) < 0) {
          errors.push(`pastExperience[${i}]: yearsOfExperience must be a non-negative number`);
        }
      });
    }
  }

  // Validate salaryPayments array if provided
  if (salaryPayments !== undefined) {
    if (!Array.isArray(salaryPayments)) {
      errors.push('salaryPayments must be an array');
    } else {
      salaryPayments.forEach((p: any, i: number) => {
        if (!p.date) errors.push(`salaryPayments[${i}]: date is required`);
        if (p.amount === undefined || isNaN(Number(p.amount)) || Number(p.amount) < 1) {
          errors.push(`salaryPayments[${i}]: amount must be greater than 0`);
        }
      });
    }
  }

  if (errors.length > 0) {
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  next();
};

/**
 * Validate adding a salary payment
 */
export const validateAddPayment = (req: Request, res: Response, next: NextFunction): void => {
  const { date, amount } = req.body;
  const errors: string[] = [];

  if (!date) errors.push('Payment date is required');
  else if (isNaN(Date.parse(date))) errors.push('Payment date must be a valid date');

  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) < 1) {
    errors.push('Payment amount must be greater than 0');
  }

  if (errors.length > 0) {
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  next();
};

