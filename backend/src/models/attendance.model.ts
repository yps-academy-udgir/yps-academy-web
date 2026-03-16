import mongoose, { Schema, Document, Types } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT  = 'absent',
  LATE    = 'late',
}

export interface IAttendance extends Document {
  studentId:   Types.ObjectId;
  classroomId: Types.ObjectId;
  date:    Date;
  subject: string;
  status:  AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema(
  {
    studentId:   { type: Schema.Types.ObjectId, ref: 'Student',   required: true, index: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    date:    { type: Date,   required: true, index: true },
    subject: { type: String, required: true, trim: true },
    status:  { type: String, required: true, enum: Object.values(AttendanceStatus), default: AttendanceStatus.PRESENT },
  },
  { timestamps: true, versionKey: false }
);

// One record per student per date per subject in a classroom
AttendanceSchema.index({ studentId: 1, classroomId: 1, date: 1, subject: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', AttendanceSchema);
