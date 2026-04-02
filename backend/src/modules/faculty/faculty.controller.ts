import { Request, Response } from 'express';
import { facultyService } from './faculty.service';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.util';
import { createFacultySchema, updateFacultySchema, addSalaryPaymentSchema } from './dto/faculty.dto';

export const getAllFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const { faculty, total } = await facultyService.getAll(
      { department: req.query['department'] as string, search: req.query['search'] as string },
      { page, limit }
    );
    paginatedResponse(res, faculty, { total, page, limit, pages: Math.ceil(total / limit) }, 'Faculty retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve faculty', 500, error.message);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await facultyService.getMe(req.user!.userId);
    successResponse(res, faculty, 'Profile retrieved successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve profile', 500, error.message);
  }
};

export const getFacultyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const faculty = await facultyService.getById(req.params['id']);
    if (!faculty) { errorResponse(res, 'Faculty member not found', 404); return; }

    // Faculty role: strip salary/payment data unless viewing own profile
    if (req.user?.role === 'faculty' && faculty.userId !== req.user.userId) {
      const { annualSalary, salaryPayments, ...publicProfile } = faculty as any;
      successResponse(res, publicProfile, 'Faculty member retrieved successfully');
      return;
    }

    successResponse(res, faculty, 'Faculty member retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve faculty member', 500, error.message);
  }
};

export const createFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createFacultySchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const result = await facultyService.create(parsed.data, req.file);
    successResponse(res, result, 'Faculty member created successfully', 201);
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    if (error.name === 'ValidationError') {
      errorResponse(res, 'Validation failed', 400, Object.values(error.errors).map((e: any) => e.message).join(', '));
      return;
    }
    errorResponse(res, 'Failed to create faculty member', 500, error.message);
  }
};

export const updateFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateFacultySchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const updated = await facultyService.update(req.params['id'], parsed.data, req.file);
    successResponse(res, updated, 'Faculty member updated successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    if (error.name === 'ValidationError') {
      errorResponse(res, 'Validation failed', 400, Object.values(error.errors).map((e: any) => e.message).join(', '));
      return;
    }
    errorResponse(res, 'Failed to update faculty member', 500, error.message);
  }
};

export const deleteFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    await facultyService.delete(req.params['id']);
    successResponse(res, null, 'Faculty member deleted successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to delete faculty member', 500, error.message);
  }
};

export const addSalaryPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = addSalaryPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const faculty = await facultyService.addSalaryPayment(req.params['id'], parsed.data);
    successResponse(res, faculty, 'Payment recorded successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    if (error.name === 'ValidationError') {
      errorResponse(res, 'Validation failed', 400, Object.values(error.errors).map((e: any) => e.message).join(', '));
      return;
    }
    errorResponse(res, 'Failed to record payment', 500, error.message);
  }
};

export const getFacultyStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await facultyService.getStats();
    successResponse(res, stats, 'Faculty statistics retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve faculty statistics', 500, error.message);
  }
};
