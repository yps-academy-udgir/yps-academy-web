import { Request, Response } from 'express';
import { examResultService } from './exam-result.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { createExamResultSchema, updateExamResultSchema, bulkExamResultSchema } from './dto/exam-result.dto';

function handleError(res: Response, error: any, fallback: string): void {
  if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
  if (error.name === 'ValidationError') {
    errorResponse(res, 'Validation failed', 400, Object.values(error.errors).map((e: any) => e.message).join(', '));
    return;
  }
  if (error.code === 11000) {
    errorResponse(res, 'Marks for this exam/month/year already exist for this student.', 409);
    return;
  }
  errorResponse(res, fallback, 500, error.message);
}

export const createExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createExamResultSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const result = await examResultService.create(parsed.data);
    successResponse(res, result, 'Exam result saved successfully', 201);
  } catch (error: any) {
    handleError(res, error, 'Failed to save exam result');
  }
};

export const getExamResultsByStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await examResultService.getByStudent(req.query['studentId'] as string);
    successResponse(res, results, 'Exam results retrieved successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve exam results', 500, error.message);
  }
};

export const getExamResultById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await examResultService.getById(req.params['id']);
    if (!result) { errorResponse(res, 'Exam result not found', 404); return; }
    successResponse(res, result, 'Exam result retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve exam result', 500, error.message);
  }
};

export const updateExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateExamResultSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const result = await examResultService.update(req.params['id'], parsed.data);
    successResponse(res, result, 'Exam result updated successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to update exam result');
  }
};

export const deleteExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    await examResultService.delete(req.params['id']);
    successResponse(res, null, 'Exam result deleted successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to delete exam result', 500, error.message);
  }
};

export const bulkSaveExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = bulkExamResultSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message).join(', '));
      return;
    }
    const result = await examResultService.bulkSave(parsed.data);
    successResponse(res, result, 'Marks saved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to save marks', 500, error.message);
  }
};

export const getExamResultsByClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await examResultService.getByClassroom(req.params['classroomId'], {
      examType: req.query['examType'] as string | undefined,
      month: req.query['month'] ? Number(req.query['month']) : undefined,
      year: req.query['year'] ? Number(req.query['year']) : undefined,
    });
    successResponse(res, results, 'Exam results retrieved successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve classroom marks', 500, error.message);
  }
};

export const getFilteredExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await examResultService.getFiltered(
      req.query['class'] as string,
      req.query['section'] as string | undefined,
      req.query['examType'] as string | undefined,
      req.query['month'] ? Number(req.query['month']) : undefined,
      req.query['year'] ? Number(req.query['year']) : undefined
    );
    successResponse(res, rows, 'Filtered exam results retrieved successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve filtered exam results', 500, error.message);
  }
};
