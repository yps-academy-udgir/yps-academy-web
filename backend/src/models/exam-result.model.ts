import mongoose, { Schema, Document, Types } from 'mongoose';

export enum ExamType {
  MONTHLY_TEST = 'Monthly Test',
  QUARTERLY    = 'Quarterly',
  HALF_YEARLY  = 'Half-yearly',
  ANNUAL       = 'Annual',
}

export interface ISubjectMark {
  subject: string;
  outOf: number;
  marksObtained: number;
}

export interface IExamResult extends Document {
  studentId: Types.ObjectId;
  examType: ExamType;
  month: number;   // 1–12
  year: number;
  subjectMarks: ISubjectMark[];
  totalMarksObtained: number;
  totalOutOf: number;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectMarkSchema = new Schema<ISubjectMark>(
  {
    subject:        { type: String, required: true, trim: true },
    outOf:          { type: Number, required: true, min: 1 },
    marksObtained:  { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ExamResultSchema = new Schema<IExamResult>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    examType:  { type: String, required: true, enum: Object.values(ExamType) },
    month:     { type: Number, required: true, min: 1, max: 12 },
    year:      { type: Number, required: true, min: 2000 },
    subjectMarks: { type: [SubjectMarkSchema], required: true, validate: { validator: (v: ISubjectMark[]) => v.length > 0, message: 'At least one subject mark is required' } },
    totalMarksObtained: { type: Number, default: 0 },
    totalOutOf:         { type: Number, default: 0 },
    percentage:         { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

// Auto-compute totals before save
ExamResultSchema.pre('save', function (next) {
  this.totalMarksObtained = this.subjectMarks.reduce((sum, s) => sum + s.marksObtained, 0);
  this.totalOutOf         = this.subjectMarks.reduce((sum, s) => sum + s.outOf, 0);
  this.percentage         = this.totalOutOf > 0 ? parseFloat(((this.totalMarksObtained / this.totalOutOf) * 100).toFixed(2)) : 0;
  next();
});

// Compound uniqueness — one entry per student per exam per month/year
ExamResultSchema.index({ studentId: 1, examType: 1, month: 1, year: 1 }, { unique: true });

export const ExamResult = mongoose.model<IExamResult>('ExamResult', ExamResultSchema);
