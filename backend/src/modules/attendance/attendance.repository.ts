import mongoose from 'mongoose';
import { Attendance, AttendanceStatus } from '../../models/attendance.model';

export const attendanceRepository = {
  async bulkUpsert(
    records: { studentId: string; status: string }[],
    classroomId: string,
    date: Date,
    subject: string
  ) {
    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, classroomId, date, subject },
        update: { $set: { status: (r.status || AttendanceStatus.PRESENT) as AttendanceStatus } },
        upsert: true,
      },
    }));
    return Attendance.bulkWrite(ops);
  },

  async findByClassroom(classroomId: string, date?: Date, subject?: string) {
    const filter: Record<string, unknown> = { classroomId };
    if (date) filter['date'] = date;
    if (subject) filter['subject'] = subject;

    return Attendance.find(filter)
      .populate('studentId', 'firstName lastName')
      .sort({ date: -1 })
      .lean();
  },

  async findByStudent(studentId: string, from?: Date, to?: Date) {
    const filter: Record<string, unknown> = { studentId };
    if (from || to) {
      filter['date'] = {};
      if (from) (filter['date'] as any).$gte = from;
      if (to) (filter['date'] as any).$lte = to;
    }
    return Attendance.find(filter).sort({ date: -1 }).lean();
  },

  async getSummaryByClassroom(classroomId: string) {
    const objId = new mongoose.Types.ObjectId(classroomId);
    return Attendance.aggregate([
      { $match: { classroomId: objId } },
      {
        $group: {
          _id: '$studentId',
          total:   { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent:  { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late:    { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
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
  },
};
