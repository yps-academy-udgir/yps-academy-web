/**
 * Faculty Model
 * Mongoose schema for Faculty entity
 * Matches frontend Faculty interface
 */

import mongoose, { Schema, Document } from 'mongoose';

export enum Department {
  MATHEMATICS = 'Mathematics',
  SCIENCE = 'Science',
  ENGLISH = 'English',
}

export enum Speciality {
  MATHEMATICS = 'Mathematics',
  SCIENCE = 'Science',
  ENGLISH = 'English',
}

export interface IPastExperience {
  organization: string;
  role: string;
  yearsOfExperience: number;
}

export interface ISalaryPayment {
  date: Date;
  amount: number;
  note?: string;
}

export interface IFaculty extends Document {
  userId?: string;          // Human-readable login ID e.g. 26-YPS-FAC-RAM-001
  rollNumber?: string;      // Global sequential faculty roll number e.g. 001
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  department: Department;
  speciality: Speciality;
  degree: string;
  yearsOfExperience: number;
  pastExperience: IPastExperience[];
  annualSalary: number;
  salaryPayments: ISalaryPayment[];
  image?: string; // Path to uploaded image
  createdAt: Date;
  updatedAt: Date;
}

const PastExperienceSchema = new Schema<IPastExperience>(
  {
    organization: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    yearsOfExperience: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SalaryPaymentSchema = new Schema<ISalaryPayment>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true },
  },
  { _id: true, timestamps: false }
);

const FacultySchema = new Schema<IFaculty>({
  userId: {
    type: String,
    unique: true,
    sparse: true,
  },
  rollNumber: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    sparse: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
  },
  contact: {
    type: String,
    required: [true, 'Contact is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: Object.values(Department),
      message: '{VALUE} is not a valid department',
    },
  },
  speciality: {
    type: String,
    required: [true, 'Speciality is required'],
    enum: {
      values: Object.values(Speciality),
      message: '{VALUE} is not a valid speciality',
    },
  },
  degree: {
    type: String,
    required: [true, 'Degree / qualification is required'],
    trim: true,
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Years of experience cannot be negative'],
  },
  pastExperience: {
    type: [PastExperienceSchema],
    default: [],
  },
  annualSalary: {
    type: Number,
    required: [true, 'Annual salary is required'],
    min: [1, 'Annual salary must be greater than 0'],
  },
  salaryPayments: {
    type: [SalaryPaymentSchema],
    default: [],
  },
  image: {
    type: String,
    required: false,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index for search performance
FacultySchema.index({ email: 1 }, { unique: true });
FacultySchema.index({ department: 1 });
FacultySchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);
