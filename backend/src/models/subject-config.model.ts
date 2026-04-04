import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectEntry {
  name: string;
  fee: number;
  isActive: boolean;
}

export interface IClassSubjectEntry {
  className: string; // e.g. '5th', '6th', ...
  subjects: ISubjectEntry[];
}

export interface ISubjectConfig extends Document {
  classSubjects: IClassSubjectEntry[];
  selfStudyFee: number;
  updatedAt: Date;
}

const subjectEntrySchema = new Schema<ISubjectEntry>(
  {
    name: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const classSubjectEntrySchema = new Schema<IClassSubjectEntry>(
  {
    className: { type: String, required: true, trim: true },
    subjects: { type: [subjectEntrySchema], default: [] },
  },
  { _id: false }
);

const subjectConfigSchema = new Schema<ISubjectConfig>(
  {
    classSubjects: { type: [classSubjectEntrySchema], default: [] },
    selfStudyFee: { type: Number, required: true, min: 0, default: 8000 },  },
  { timestamps: true }
);

export const SubjectConfig = mongoose.model<ISubjectConfig>('SubjectConfig', subjectConfigSchema);