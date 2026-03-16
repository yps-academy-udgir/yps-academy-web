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

/**
 * Validate classroom creation/update data
 */
export const validateClassroom = (req: Request, res: Response, next: NextFunction): void => {
  const { class: classValue, section, roomNumber, capacity, academicYear } = req.body;
  const errors: string[] = [];

  const validClasses = ['5th', '6th', '7th', '8th', '9th', '10th'];

  if (req.method === 'POST') {
    if (!classValue || !validClasses.includes(classValue)) {
      errors.push('Class must be one of: ' + validClasses.join(', '));
    }
    if (!section || !/^[A-Z]$/i.test(section.trim())) {
      errors.push('Section must be a single letter (A-Z)');
    }
    if (!roomNumber || roomNumber.trim().length < 1) {
      errors.push('Room number is required');
    }
    if (capacity === undefined || capacity === null || isNaN(Number(capacity)) || Number(capacity) < 1) {
      errors.push('Capacity must be at least 1');
    }
    if (!academicYear || !/^\d{4}-\d{4}$/.test(academicYear)) {
      errors.push('Academic year must be in YYYY-YYYY format (e.g., 2025-2026)');
    }
  }

  if (req.method === 'PUT') {
    if (classValue !== undefined && !validClasses.includes(classValue)) {
      errors.push('Class must be one of: ' + validClasses.join(', '));
    }
    if (section !== undefined && !/^[A-Z]$/i.test(section.trim())) {
      errors.push('Section must be a single letter (A-Z)');
    }
    if (roomNumber !== undefined && roomNumber.trim().length < 1) {
      errors.push('Room number is required');
    }
    if (capacity !== undefined && (isNaN(Number(capacity)) || Number(capacity) < 1)) {
      errors.push('Capacity must be at least 1');
    }
    if (academicYear !== undefined && !/^\d{4}-\d{4}$/.test(academicYear)) {
      errors.push('Academic year must be in YYYY-YYYY format (e.g., 2025-2026)');
    }
  }

  if (errors.length > 0) {
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  next();
};

/**
 * Validate faculty assignment to classroom
 */
export const validateFacultyAssignment = (req: Request, res: Response, next: NextFunction): void => {
  const { facultyId, subject, isPrimary } = req.body;
  const errors: string[] = [];

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const validSubjects = ['Mathematics', 'Science', 'English'];

  if (!facultyId || !objectIdRegex.test(facultyId)) {
    errors.push('Valid faculty ID is required');
  }

  if (!subject || !validSubjects.includes(subject)) {
    errors.push('Subject must be one of: ' + validSubjects.join(', '));
  }

  if (isPrimary !== undefined && typeof isPrimary !== 'boolean') {
    errors.push('isPrimary must be a boolean value');
  }

  if (errors.length > 0) {
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  next();
};

/**
 * Validate student enrollment
 */
export const validateStudentEnrollment = (req: Request, res: Response, next: NextFunction): void => {
  const { studentId } = req.body;
  const errors: string[] = [];

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!studentId || !objectIdRegex.test(studentId)) {
    errors.push('Valid student ID is required');
  }

  if (errors.length > 0) {
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  next();
};

/**
 * Validate schedule update
 */
export const validateScheduleUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { schedule } = req.body;
  const errors: string[] = [];

  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const validSubjects = ['Mathematics', 'Science', 'English'];
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!Array.isArray(schedule)) {
    errors.push('Schedule must be an array');
  } else {
    schedule.forEach((slot: any, i: number) => {
      if (!slot.day || !validDays.includes(slot.day)) {
        errors.push(`schedule[${i}]: Day must be one of: ${validDays.join(', ')}`);
      }
      if (slot.period === undefined || !Number.isInteger(slot.period) || slot.period < 1 || slot.period > 8) {
        errors.push(`schedule[${i}]: Period must be an integer between 1 and 8`);
      }
      if (!slot.subject || !validSubjects.includes(slot.subject)) {
        errors.push(`schedule[${i}]: Subject must be one of: ${validSubjects.join(', ')}`);
      }
      if (!slot.facultyId || !objectIdRegex.test(slot.facultyId)) {
        errors.push(`schedule[${i}]: Valid faculty ID is required`);
      }
      if (!slot.startTime || !timeRegex.test(slot.startTime)) {
        errors.push(`schedule[${i}]: Start time must be in HH:MM format`);
      }
      if (!slot.endTime || !timeRegex.test(slot.endTime)) {
        errors.push(`schedule[${i}]: End time must be in HH:MM format`);
      }
    });
  }

  if (errors.length > 0) {
    errorResponse(res, 'Validation failed', 400, errors);
    return;
  }

  next();
};

