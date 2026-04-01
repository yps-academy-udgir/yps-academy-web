import { Request, Response } from 'express';
import { attendanceService } from './attendance.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { bulkAttendanceSchema } from './dto/attendance.dto';

export const bulkMarkAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = bulkAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, parsed.error.issues.map(i => i.message).join(', '), 400);
      return;
    }
    const result = await attendanceService.bulkMark(parsed.data);
    successResponse(res, result, 'Attendance saved');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to save attendance', 500, error.message);
  }
};

export const getAttendanceByClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const records = await attendanceService.getByClassroom(
      req.query['classroomId'] as string,
      req.query['date'] as string | undefined,
      req.query['subject'] as string | undefined
    );
    successResponse(res, records, 'Attendance retrieved successfully');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve attendance', 500, error.message);
  }
};

export const getStudentAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await attendanceService.getByStudent(
      req.params['id'],
      req.query['from'] as string | undefined,
      req.query['to'] as string | undefined
    );
    successResponse(res, data, 'Student attendance retrieved');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve student attendance', 500, error.message);
  }
};

export const getAttendanceSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await attendanceService.getSummary(req.query['classroomId'] as string);
    successResponse(res, summary, 'Attendance summary retrieved');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Failed to retrieve attendance summary', 500, error.message);
  }
};
