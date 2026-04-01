import mongoose from 'mongoose';
import { attendanceRepository } from './attendance.repository';
import { AttendanceStatus } from '../../models/attendance.model';
import type { BulkAttendanceDto } from './dto/attendance.dto';

function serviceError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export const attendanceService = {
  async bulkMark(dto: BulkAttendanceDto) {
    const parsedDate = new Date(dto.date);
    parsedDate.setHours(0, 0, 0, 0);

    const result = await attendanceRepository.bulkUpsert(
      dto.records as { studentId: string; status: string }[],
      dto.classroomId,
      parsedDate,
      dto.subject
    );

    return { upserted: result.upsertedCount, modified: result.modifiedCount };
  },

  async getByClassroom(classroomId: string, dateStr?: string, subject?: string) {
    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      throw serviceError('Valid classroomId is required', 400);
    }

    let date: Date | undefined;
    if (dateStr) {
      date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
    }

    return attendanceRepository.findByClassroom(classroomId, date, subject);
  },

  async getByStudent(studentId: string, from?: string, to?: string) {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw serviceError('Invalid student ID', 400);
    }

    const records = await attendanceRepository.findByStudent(
      studentId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined
    );

    const total = records.length;
    const present = records.filter((r: any) => r.status === AttendanceStatus.PRESENT).length;
    const absent  = records.filter((r: any) => r.status === AttendanceStatus.ABSENT).length;
    const late    = records.filter((r: any) => r.status === AttendanceStatus.LATE).length;
    const percentage = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 0;

    return { records, summary: { total, present, absent, late, percentage } };
  },

  async getSummary(classroomId: string) {
    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      throw serviceError('Valid classroomId is required', 400);
    }
    return attendanceRepository.getSummaryByClassroom(classroomId);
  },
};
