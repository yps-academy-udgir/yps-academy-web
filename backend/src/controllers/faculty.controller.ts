/**
 * Faculty Controller
 * Handles all business logic for faculty operations
 * Follows industry-standard controller pattern
 */

import { Request, Response } from 'express';
import { Faculty } from '../models/faculty.model';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';

/**
 * Get all faculty with pagination and optional department filter
 * @route GET /api/faculty
 * @query page, limit, department, search
 */
export const getAllFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const department = req.query.department as string | undefined;
    const search = req.query.search as string | undefined;

    const filter: Record<string, any> = {};

    if (department) {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }

    const [faculty, total] = await Promise.all([
      Faculty.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Faculty.countDocuments(filter),
    ]);

    const pagination = { total, page, limit, pages: Math.ceil(total / limit) };

    paginatedResponse(res, faculty, pagination, 'Faculty retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve faculty', 500, error.message);
  }
};

/**
 * Get single faculty member by ID
 * @route GET /api/faculty/:id
 */
export const getFacultyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await Faculty.findById(req.params.id).lean();

    if (!faculty) {
      errorResponse(res, 'Faculty member not found', 404);
      return;
    }

    successResponse(res, faculty, 'Faculty member retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve faculty member', 500, error.message);
  }
};

/**
 * Create new faculty member
 * @route POST /api/faculty
 */
export const createFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, contact, department, speciality, degree, yearsOfExperience, pastExperience, annualSalary, salaryPayments } = req.body;

    const existing = await Faculty.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      errorResponse(res, 'A faculty member with this email already exists', 400);
      return;
    }

    const faculty = await Faculty.create({
      firstName,
      lastName,
      email,
      contact,
      department,
      speciality,
      degree,
      yearsOfExperience,
      pastExperience: pastExperience ?? [],
      annualSalary,
      salaryPayments: salaryPayments ?? [],
    });

    successResponse(res, faculty, 'Faculty member created successfully', 201);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      errorResponse(res, 'Validation failed', 400, messages.join(', '));
      return;
    }
    errorResponse(res, 'Failed to create faculty member', 500, error.message);
  }
};

/**
 * Update faculty member
 * @route PUT /api/faculty/:id
 */
export const updateFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, contact, department, speciality, degree, yearsOfExperience, pastExperience, annualSalary, salaryPayments } = req.body;

    const existing = await Faculty.findById(id);
    if (!existing) {
      errorResponse(res, 'Faculty member not found', 404);
      return;
    }

    if (email && email.toLowerCase().trim() !== existing.email) {
      const emailTaken = await Faculty.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (emailTaken) {
        errorResponse(res, 'Email already in use by another faculty member', 400);
        return;
      }
    }

    const updated = await Faculty.findByIdAndUpdate(
      id,
      {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(contact !== undefined && { contact }),
        ...(department !== undefined && { department }),
        ...(speciality !== undefined && { speciality }),
        ...(degree !== undefined && { degree }),
        ...(yearsOfExperience !== undefined && { yearsOfExperience }),
        ...(pastExperience !== undefined && { pastExperience }),
        ...(annualSalary !== undefined && { annualSalary }),
        ...(salaryPayments !== undefined && { salaryPayments }),
      },
      { new: true, runValidators: true }
    ).lean();

    successResponse(res, updated, 'Faculty member updated successfully');
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      errorResponse(res, 'Validation failed', 400, messages.join(', '));
      return;
    }
    errorResponse(res, 'Failed to update faculty member', 500, error.message);
  }
};

/**
 * Delete faculty member
 * @route DELETE /api/faculty/:id
 */
export const deleteFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      errorResponse(res, 'Faculty member not found', 404);
      return;
    }

    successResponse(res, null, 'Faculty member deleted successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to delete faculty member', 500, error.message);
  }
};

/**
 * Add a salary payment to a faculty member
 * @route POST /api/faculty/:id/payments
 */
export const addSalaryPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, amount, note } = req.body;

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      errorResponse(res, 'Faculty member not found', 404);
      return;
    }

    faculty.salaryPayments.push({ date: new Date(date), amount, note });
    await faculty.save();

    successResponse(res, faculty, 'Payment recorded successfully');
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      errorResponse(res, 'Validation failed', 400, messages.join(', '));
      return;
    }
    errorResponse(res, 'Failed to record payment', 500, error.message);
  }
};

/**
 * Get faculty statistics (for dashboard)
 * @route GET /api/faculty/stats/overview
 */
export const getFacultyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [total, byDepartment] = await Promise.all([
      Faculty.countDocuments(),
      Faculty.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const stats = {
      total,
      byDepartment: byDepartment.reduce((acc: Record<string, number>, d) => {
        acc[d._id] = d.count;
        return acc;
      }, {}),
    };

    successResponse(res, stats, 'Faculty statistics retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve faculty statistics', 500, error.message);
  }
};
