import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Attendance, AttendanceStatus } from '../models/attendance.model';
import { successResponse, errorResponse } from '../utils/response.util';

// POST /api/attendance/bulk
// Body: { classroomId, date, subject, records: [{ studentId, status }] }
export const bulkMarkAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classroomId, date, subject, records } = req.body;

    if (!classroomId || !date || !subject || !Array.isArray(records) || records.length === 0) {
      errorResponse(res, 'classroomId, date, subject and records are required', 400);
      return;
    }

    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);

    const ops = records.map((r: { studentId: string; status: string }) => ({
      updateOne: {
        filter: { studentId: r.studentId, classroomId, date: parsedDate, subject },
        update: { $set: { status: (r.status || AttendanceStatus.PRESENT) as AttendanceStatus } },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(ops);
    successResponse(res, { upserted: result.upsertedCount, modified: result.modifiedCount }, 'Attendance saved');
  } catch (error: any) {
    errorResponse(res, 'Failed to save attendance', 500, error.message);
  }
};

// GET /api/attendance?classroomId=xxx&date=yyyy-mm-dd&subject=xxx
export const getAttendanceByClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classroomId, date, subject } = req.query;

    if (!classroomId || !mongoose.Types.ObjectId.isValid(classroomId as string)) {
      errorResponse(res, 'Valid classroomId is required', 400);
      return;
    }

    const filter: any = { classroomId };
    if (date) {
      const d = new Date(date as string);
      d.setHours(0, 0, 0, 0);
      filter.date = d;
    }
    if (subject) filter.subject = subject;

    const records = await Attendance.find(filter)
      .populate('studentId', 'firstName lastName')
      .sort({ date: -1 })
      .lean();

    successResponse(res, records, 'Attendance retrieved successfully');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve attendance', 500, error.message);
  }
};

// GET /api/attendance/students/:id?from=yyyy-mm-dd&to=yyyy-mm-dd
export const getStudentAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      errorResponse(res, 'Invalid student ID', 400);
      return;
    }

    const filter: any = { studentId: id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from as string);
      if (to)   filter.date.$lte = new Date(to as string);
    }

    const records = await Attendance.find(filter).sort({ date: -1 }).lean();
    const total   = records.length;
    const present = records.filter((r: any) => r.status === AttendanceStatus.PRESENT).length;
    const absent  = records.filter((r: any) => r.status === AttendanceStatus.ABSENT).length;
    const late    = records.filter((r: any) => r.status === AttendanceStatus.LATE).length;
    const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

    successResponse(res, { records, summary: { total, present, absent, late, percentage } }, 'Student attendance retrieved');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve student attendance', 500, error.message);
  }
};

// GET /api/attendance/summary?classroomId=xxx
export const getAttendanceSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classroomId } = req.query;

    if (!classroomId || !mongoose.Types.ObjectId.isValid(classroomId as string)) {
      errorResponse(res, 'Valid classroomId is required', 400);
      return;
    }

    const objId = new mongoose.Types.ObjectId(classroomId as string);
    const summary = await Attendance.aggregate([
      { $match: { classroomId: objId } },
      {
        $group: {
          _id: '$studentId',
          total:   { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent']  }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late']    }, 1, 0] } },
        },
      },
      {
        $addFields: {
          percentage: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      { $sort: { percentage: 1 } },
    ]);

    successResponse(res, summary, 'Attendance summary retrieved');
  } catch (error: any) {
    errorResponse(res, 'Failed to retrieve attendance summary', 500, error.message);
  }
};
