import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ExamResult, ExamType } from '../models/exam-result.model';
import { successResponse, errorResponse } from '../utils/response.util';

// POST /api/exam-results
export const createExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, examType, month, year, subjectMarks } = req.body;

    const existing = await ExamResult.findOne({ studentId, examType, month, year });
    if (existing) {
      errorResponse(res, `Marks for ${examType} - ${month}/${year} already exist for this student. Use update instead.`, 409);
      return;
    }

    const result = new ExamResult({ studentId, examType, month, year, subjectMarks });
    await result.save();
    successResponse(res, result, 'Exam result saved successfully', 201);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e: any) => e.message);
      errorResponse(res, 'Validation failed', 400, msgs.join(', '));
      return;
    }
    if (error.code === 11000) {
      errorResponse(res, 'Marks for this exam/month/year already exist for this student.', 409);
      return;
    }
    errorResponse(res, 'Failed to save exam result', 500, error.message);
  }
};

// GET /api/exam-results?studentId=xxx
export const getExamResultsByStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.query;
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId as string)) {
      errorResponse(res, 'Valid studentId query param is required', 400);
      return;
    }
    const results = await ExamResult.find({ studentId }).sort({ year: -1, month: -1 }).lean();
    successResponse(res, results, 'Exam results retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve exam results', 500, error.message);
  }
};

// GET /api/exam-results/:id
export const getExamResultById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ExamResult.findById(req.params.id).lean();
    if (!result) { errorResponse(res, 'Exam result not found', 404); return; }
    successResponse(res, result, 'Exam result retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve exam result', 500, error.message);
  }
};

// PUT /api/exam-results/:id
export const updateExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examType, month, year, subjectMarks } = req.body;

    const existing = await ExamResult.findById(req.params.id);
    if (!existing) { errorResponse(res, 'Exam result not found', 404); return; }

    if (examType)     existing.examType     = examType;
    if (month)        existing.month        = month;
    if (year)         existing.year         = year;
    if (subjectMarks) existing.subjectMarks = subjectMarks;

    await existing.save(); // triggers pre-save totals recompute
    successResponse(res, existing, 'Exam result updated successfully');
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map((e: any) => e.message);
      errorResponse(res, 'Validation failed', 400, msgs.join(', '));
      return;
    }
    if (error.code === 11000) {
      errorResponse(res, 'Marks for this exam/month/year already exist for this student.', 409);
      return;
    }
    errorResponse(res, 'Failed to update exam result', 500, error.message);
  }
};

// DELETE /api/exam-results/:id
export const deleteExamResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ExamResult.findByIdAndDelete(req.params.id);
    if (!result) { errorResponse(res, 'Exam result not found', 404); return; }
    successResponse(res, null, 'Exam result deleted successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to delete exam result', 500, error.message);
  }
};
