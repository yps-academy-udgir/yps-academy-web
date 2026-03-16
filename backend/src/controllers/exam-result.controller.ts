import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ExamResult, ExamType } from '../models/exam-result.model';
import Classroom from '../models/classroom.model';
import { bulkExamResultSchema } from '../schemas/exam-result.schema';
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

// POST /api/exam-results/bulk
export const bulkSaveExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = bulkExamResultSchema.safeParse(req.body);
    if (!parsed.success) {
      const msgs = parsed.error.issues.map((e: { message: string }) => e.message).join(', ');
      errorResponse(res, 'Validation failed', 400, msgs);
      return;
    }
    const { examType, month, year, records } = parsed.data;

    const saved = await Promise.all(
      records.map(async (record: { studentId: string; subjectMarks: { subject: string; outOf: number; marksObtained: number }[] }) => {
        let doc = await ExamResult.findOne({ studentId: record.studentId, examType, month, year });
        if (doc) {
          doc.subjectMarks = record.subjectMarks as any;
        } else {
          doc = new ExamResult({ studentId: record.studentId, examType, month, year, subjectMarks: record.subjectMarks });
        }
        return doc.save();
      })
    );

    successResponse(res, { count: saved.length }, 'Marks saved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to save marks', 500, error.message);
  }
};

// GET /api/exam-results/classroom/:classroomId?examType=&month=&year=
export const getExamResultsByClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classroomId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      errorResponse(res, 'Invalid classroomId', 400);
      return;
    }

    const classroom = await Classroom.findById(classroomId).select('enrolledStudents').lean();
    if (!classroom) { errorResponse(res, 'Classroom not found', 404); return; }

    const filter: Record<string, unknown> = { studentId: { $in: classroom.enrolledStudents } };
    const { examType, month, year } = req.query;
    if (examType) filter.examType = examType;
    if (month)    filter.month = Number(month);
    if (year)     filter.year  = Number(year);

    const results = await ExamResult.find(filter)
      .populate('studentId', 'firstName lastName')
      .lean();

    successResponse(res, results, 'Exam results retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve classroom marks', 500, error.message);
  }
};

// GET /api/exam-results/filter?class=5th&section=A&examType=&month=&year=
export const getFilteredExamResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const classValue = req.query.class as string | undefined;
    const section = req.query.section as string | undefined;
    const examType = req.query.examType as string | undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    if (!classValue) {
      errorResponse(res, 'class query param is required', 400);
      return;
    }

    const classroomFilter: Record<string, unknown> = { class: classValue };
    if (section) {
      classroomFilter.section = section;
    }

    const classrooms = await Classroom.find(classroomFilter)
      .select('class section roomNumber enrolledStudents')
      .lean();

    if (classrooms.length === 0) {
      successResponse(res, [], 'No classrooms found for selected filters');
      return;
    }

    const studentToClassroom = new Map<string, { class: string; section: string; roomNumber: string }>();
    const studentIds: mongoose.Types.ObjectId[] = [];

    for (const classroom of classrooms) {
      for (const sid of classroom.enrolledStudents) {
        const studentId = String(sid);
        if (!studentToClassroom.has(studentId)) {
          studentToClassroom.set(studentId, {
            class: classroom.class,
            section: classroom.section,
            roomNumber: classroom.roomNumber,
          });
          studentIds.push(new mongoose.Types.ObjectId(studentId));
        }
      }
    }

    const filter: Record<string, unknown> = { studentId: { $in: studentIds } };
    if (examType) filter.examType = examType;
    if (month) filter.month = month;
    if (year) filter.year = year;

    const results = await ExamResult.find(filter)
      .populate('studentId', 'firstName lastName')
      .lean();

    const rows = results.map((result) => {
      const sid = String(result.studentId && typeof result.studentId === 'object' ? (result.studentId as any)._id : result.studentId);
      const classroom = studentToClassroom.get(sid);
      const student = result.studentId as any;

      return {
        _id: result._id,
        studentId: sid,
        studentName: student ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() : 'Unknown',
        class: classroom?.class ?? classValue,
        section: classroom?.section ?? '-',
        roomNumber: classroom?.roomNumber ?? '-',
        examType: result.examType,
        month: result.month,
        year: result.year,
        subjectMarks: result.subjectMarks,
        totalMarksObtained: result.totalMarksObtained,
        totalOutOf: result.totalOutOf,
        percentage: result.percentage,
      };
    });

    successResponse(res, rows, 'Filtered exam results retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve filtered exam results', 500, error.message);
  }
};
