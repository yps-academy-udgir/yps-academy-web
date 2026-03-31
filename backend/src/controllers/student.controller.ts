/**
 * Student Controller
 * Handles all business logic for student operations
 * Follows industry-standard controller pattern
 */

import { Request, Response } from 'express';
import { Student, IStudent } from '../models/student.model';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { calculateFeeDetails } from '../utils/fee-calculator.util';

/**
 * Get all students with pagination and filtering
 * @route GET /api/students
 * @query page, limit, gender, search
 */
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const gender = req.query.gender as string;
    const search = req.query.search as string;

    // Build filter query
    const filter: any = {};

    if (gender) {
      filter.gender = gender;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute queries
    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(filter),
    ]);

    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };

    paginatedResponse(res, students, pagination, 'Students retrieved successfully');
  } catch (error: any) {
    console.error('Get all students error:', error);
    errorResponse(res, 'Failed to retrieve students', 500, error.message);
  }
};

/**
 * Get single student by ID
 * @route GET /api/students/:id
 */
export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).lean();

    if (!student) {
      errorResponse(res, 'Student not found', 404);
      return;
    }

    successResponse(res, student, 'Student retrieved successfully');
  } catch (error: any) {
    console.error('Get student by ID error:', error);
    errorResponse(res, 'Failed to retrieve student', 500, error.message);
  }
};

/**
 * Create new student
 * @route POST /api/students
 */
export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, contact, gender, academicDetails, feeDetails } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      errorResponse(res, 'Student with this email already exists', 400);
      return;
    }

    // Calculate fee details based on academic details
    const calculatedFeeDetails = calculateFeeDetails(academicDetails, feeDetails);

    // Handle image upload
    let imagePath;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Create new student
    const student = await Student.create({
      firstName,
      lastName,
      email,
      contact,
      gender,
      ...(academicDetails && { academicDetails }),
      feeDetails: calculatedFeeDetails,
      ...(imagePath && { image: imagePath }),
    });

    successResponse(res, student, 'Student created successfully', 201);
  } catch (error: any) {
    console.error('Create student error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      errorResponse(res, 'Validation failed', 400, validationErrors.join(', '));
      return;
    }

    errorResponse(res, 'Failed to create student', 500, error.message);
  }
};

/**
 * Update student
 * @route PUT /api/students/:id
 */
export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, contact, gender, academicDetails, feeDetails } = req.body;

    // Check if student exists
    const existingStudent = await Student.findById(id);
    if (!existingStudent) {
      errorResponse(res, 'Student not found', 404);
      return;
    }

    // Check if email is being changed to one that already exists
    if (email && email !== existingStudent.email) {
      const emailExists = await Student.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        errorResponse(res, 'Email already in use by another student', 400);
        return;
      }
    }

    // Prepare academic details (use provided or existing)
    const updatedAcademicDetails = academicDetails || existingStudent.academicDetails;

    // Calculate fee details based on updated academic details
    // Merge with existing fee details (to preserve payment history)
    const calculatedFeeDetails = calculateFeeDetails(
      updatedAcademicDetails,
      feeDetails || existingStudent.feeDetails
    );

    // Handle image upload
    let imagePath = existingStudent.image;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(contact && { contact }),
        ...(gender && { gender }),
        ...(academicDetails && { academicDetails }),
        feeDetails: calculatedFeeDetails,
        ...(imagePath && { image: imagePath }),
      },
      { new: true, runValidators: true }
    ).lean();

    successResponse(res, updatedStudent, 'Student updated successfully');
  } catch (error: any) {
    console.error('Update student error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      errorResponse(res, 'Validation failed', 400, validationErrors.join(', '));
      return;
    }

    errorResponse(res, 'Failed to update student', 500, error.message);
  }
};

/**
 * Delete student
 * @route DELETE /api/students/:id
 */
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      errorResponse(res, 'Student not found', 404);
      return;
    }

    successResponse(res, null, 'Student deleted successfully');
  } catch (error: any) {
    console.error('Delete student error:', error);
    errorResponse(res, 'Failed to delete student', 500, error.message);
  }
};

/**
 * Get student statistics (for dashboard)
 * @route GET /api/students/stats/overview
 */
export const getStudentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [total, maleCount, femaleCount] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ gender: 'male' }),
      Student.countDocuments({ gender: 'female' }),
    ]);

    const stats = {
      total,
      byGender: {
        male: maleCount,
        female: femaleCount,
      },
    };

    successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error: any) {
    console.error('Get student stats error:', error);
    errorResponse(res, 'Failed to retrieve statistics', 500, error.message);
  }
};

/**
 * Record a fee payment for a student
 * @route POST /api/students/:id/payments
 */
export const addPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, remarks } = req.body;

    if (!amount || Number(amount) <= 0) {
      errorResponse(res, 'A valid positive payment amount is required', 400);
      return;
    }

    const student = await Student.findById(id);
    if (!student) {
      errorResponse(res, 'Student not found', 404);
      return;
    }

    if (!student.feeDetails) {
      errorResponse(res, 'Student has no fee details configured', 400);
      return;
    }

    student.feeDetails.paymentHistory.push({
      amount: Number(amount),
      paymentDate: new Date(),
      ...(paymentMethod && { paymentMethod }),
      ...(remarks && { remarks }),
    });
    student.feeDetails.paidAmount = (student.feeDetails.paidAmount || 0) + Number(amount);
    student.feeDetails.pendingFees = Math.max(
      0,
      (student.feeDetails.totalFees || 0) - student.feeDetails.paidAmount
    );

    await student.save();
    successResponse(res, student, 'Payment recorded successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to record payment', 500, error.message);
  }
};

/**
 * Get fee summary grouped by class
 * @route GET /api/students/fees/summary
 */
export const getFeesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await Student.find(
      {},
      'academicDetails.class feeDetails.totalFees feeDetails.paidAmount feeDetails.pendingFees'
    ).lean();

    type ClassSummary = { totalFees: number; collected: number; pending: number; studentCount: number };
    const byClass: Record<string, ClassSummary> = {};
    const totals: ClassSummary = { totalFees: 0, collected: 0, pending: 0, studentCount: 0 };

    for (const student of students) {
      const cls = (student as any).academicDetails?.class ?? 'Unassigned';
      if (!byClass[cls]) byClass[cls] = { totalFees: 0, collected: 0, pending: 0, studentCount: 0 };

      const fees = (student as any).feeDetails;
      byClass[cls].studentCount++;
      byClass[cls].totalFees += fees?.totalFees ?? 0;
      byClass[cls].collected += fees?.paidAmount ?? 0;
      byClass[cls].pending += fees?.pendingFees ?? 0;

      totals.studentCount++;
      totals.totalFees += fees?.totalFees ?? 0;
      totals.collected += fees?.paidAmount ?? 0;
      totals.pending += fees?.pendingFees ?? 0;
    }

    successResponse(res, { byClass, totals }, 'Fee summary retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve fee summary', 500, error.message);
  }
};

/**
 * Get fee defaulters (students with pending fees > 0)
 * @route GET /api/students/fees/defaulters
 */
export const getFeeDefaulters = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await Student.find(
      { 'feeDetails.pendingFees': { $gt: 0 } },
      'firstName lastName email contact academicDetails.class feeDetails.totalFees feeDetails.paidAmount feeDetails.pendingFees'
    )
      .sort({ 'feeDetails.pendingFees': -1 })
      .lean();

    successResponse(res, students, 'Fee defaulters retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve fee defaulters', 500, error.message);
  }
};
