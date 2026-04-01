import { Request, Response } from 'express';
import { studentService } from './student.service';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.util';
import { createStudentSchema, updateStudentSchema, addPaymentSchema } from './dto/student.dto';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await studentService.getMe(req.user!.userId);
    successResponse(res, student, 'Profile retrieved successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve profile', 500, error.message);
  }
};

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const { students, total } = await studentService.getAll(
      { gender: req.query['gender'] as string, search: req.query['search'] as string },
      { page, limit }
    );
    paginatedResponse(res, students, { total, page, limit, pages: Math.ceil(total / limit) }, 'Students retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve students', 500, error.message);
  }
};

export const getStudentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const student = await studentService.getById(req.params['id']);
    if (!student) { errorResponse(res, 'Student not found', 404); return; }
    successResponse(res, student, 'Student retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve student', 500, error.message);
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const result = await studentService.create(parsed.data, req.file);
    successResponse(res, result, 'Student created successfully', 201);
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    if (error.name === 'ValidationError') {
      errorResponse(res, 'Validation failed', 400, Object.values(error.errors).map((e: any) => e.message).join(', '));
      return;
    }
    errorResponse(res, 'Failed to create student', 500, error.message);
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const updated = await studentService.update(req.params['id'], parsed.data, req.file);
    successResponse(res, updated, 'Student updated successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    if (error.name === 'ValidationError') {
      errorResponse(res, 'Validation failed', 400, Object.values(error.errors).map((e: any) => e.message).join(', '));
      return;
    }
    errorResponse(res, 'Failed to update student', 500, error.message);
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    await studentService.delete(req.params['id']);
    successResponse(res, null, 'Student deleted successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to delete student', 500, error.message);
  }
};

export const getStudentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await studentService.getStats();
    successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve statistics', 500, error.message);
  }
};

export const addPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = addPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const student = await studentService.addPayment(req.params['id'], parsed.data);
    successResponse(res, student, 'Payment recorded successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to record payment', 500, error.message);
  }
};

export const getFeesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await studentService.getFeesSummary();
    successResponse(res, summary, 'Fee summary retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve fee summary', 500, error.message);
  }
};

export const getFeeDefaulters = async (req: Request, res: Response): Promise<void> => {
  try {
    const defaulters = await studentService.getFeeDefaulters();
    successResponse(res, defaulters, 'Fee defaulters retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve fee defaulters', 500, error.message);
  }
};
