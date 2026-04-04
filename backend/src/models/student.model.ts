/**
 * Student Model
 * Mongoose schema for Student entity
 * Matches frontend Student interface
 */

import mongoose, { Schema, Document } from 'mongoose';

// Gender enum
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

// Class enum
export enum Class {
  FIFTH = '5th',
  SIXTH = '6th',
  SEVENTH = '7th',
  EIGHTH = '8th',
  NINTH = '9th',
  TENTH = '10th',
}

// Available subjects
export enum Subject {
  MATHEMATICS = 'Mathematics',
  SCIENCE = 'Science',
  ENGLISH = 'English',
}

// Student lifecycle status
export enum StudentStatus {
  ACTIVE  = 'active',
  ALUMNI  = 'alumni',
  DROPPED = 'dropped',
}

// Academic Details Interface
export interface IAcademicDetails {
  yearOfAdmission: string;
  class: Class;
  subjects: string[];
  selfStudyMode: boolean;
}

// Academic History Entry — one per past academic year
export interface IAcademicHistoryEntry {
  academicYear: string;        // e.g. "2026-2027"
  class: Class;
  classroomId?: string;
  classroomName?: string;      // denormalised "8th-A" for display
  subjects: string[];
  promotedAt: Date;
}

// Payment History Interface
export interface IPayment {
  amount: number;
  paymentDate: Date;
  paymentMethod?: string;
  remarks?: string;
}

// Fee Breakdown Interface
export interface IFeeBreakdown {
  baseFeePerSubject: number;
  numberOfSubjects: number;
  subjectsFee: number;
  selfStudyFee: number;
  discount: number;
}

// Fee Details Interface
export interface IFeeDetails {
  totalFees: number;
  paidAmount: number;
  pendingFees: number;
  feeBreakdown?: IFeeBreakdown;
  paymentHistory: IPayment[];
}

// Student Interface
export interface IStudent extends Document {
  userId?: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  gender: Gender;
  status: StudentStatus;
  academicDetails?: IAcademicDetails;
  academicHistory: IAcademicHistoryEntry[];
  feeDetails?: IFeeDetails;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Academic Details Schema
const AcademicDetailsSchema = new Schema({
  yearOfAdmission: {
    type: String,
    required: false,
    match: [/^\d{4}-\d{4}$/, 'Year of admission must be in format YYYY-YYYY (example: 2026-2027)'],
  },
  class: {
    type: String,
    required: false,
    enum: {
      values: [Class.FIFTH, Class.SIXTH, Class.SEVENTH, Class.EIGHTH, Class.NINTH, Class.TENTH],
      message: '{VALUE} is not a valid class',
    },
  },
  subjects: {
    type: [String],
    required: false,
    default: [],
    validate: {
      validator: function(subjects: string[]) {
        return subjects.length <= 10; // Limit to 10 subjects
      },
      message: 'Cannot have more than 10 subjects',
    },
  },
  selfStudyMode: {
    type: Boolean,
    required: false,
    default: false,
  },
}, { _id: false });

// Academic History Entry Schema
const AcademicHistoryEntrySchema = new Schema({
  academicYear: { type: String, required: true },
  class: {
    type: String,
    required: true,
    enum: [Class.FIFTH, Class.SIXTH, Class.SEVENTH, Class.EIGHTH, Class.NINTH, Class.TENTH],
  },
  classroomId:   { type: Schema.Types.ObjectId, ref: 'Classroom', required: false },
  classroomName: { type: String, required: false },
  subjects:      { type: [String], default: [] },
  promotedAt:    { type: Date, required: true, default: Date.now },
}, { _id: false });

// Payment Schema
const PaymentSchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative'],
  },
  paymentDate: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    required: false,
    trim: true,
  },
  remarks: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Remarks cannot exceed 200 characters'],
  },
}, { _id: false, timestamps: true });

// Fee Breakdown Schema
const FeeBreakdownSchema = new Schema({
  baseFeePerSubject: {
    type: Number,
    required: false,
    default: 0,
  },
  numberOfSubjects: {
    type: Number,
    required: false,
    default: 0,
  },
  subjectsFee: {
    type: Number,
    required: false,
    default: 0,
  },
  selfStudyFee: {
    type: Number,
    required: false,
    default: 0,
  },
  discount: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
}, { _id: false });

// Fee Details Schema
const FeeDetailsSchema = new Schema({
  totalFees: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'Total fees cannot be negative'],
  },
  paidAmount: {
    type: Number,
    required: false,
    default: 0,
    min: [0, 'Paid amount cannot be negative'],
  },
  pendingFees: {
    type: Number,
    required: false,
    default: 0,
  },
  feeBreakdown: FeeBreakdownSchema,
  paymentHistory: {
    type: [PaymentSchema],
    default: [],
  },
}, { _id: false });

// Student Schema
const StudentSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true,
    },
    rollNumber: {
      type: String,
      required: false,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [
        /^\+?[\d\s-]{10,15}$/,
        'Please enter a valid contact number',
      ],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: [Gender.MALE, Gender.FEMALE],
        message: '{VALUE} is not a valid gender',
      },
    },
    academicDetails: AcademicDetailsSchema,
    academicHistory: {
      type: [AcademicHistoryEntrySchema],
      default: [],
    },
    status: {
      type: String,
      enum: [StudentStatus.ACTIVE, StudentStatus.ALUMNI, StudentStatus.DROPPED],
      default: StudentStatus.ACTIVE,
    },
    feeDetails: FeeDetailsSchema,
    image: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Removes __v field
  }
);

// Indexes for better query performance
// Note: email index is automatically created by unique: true
StudentSchema.index({ firstName: 1, lastName: 1 });
StudentSchema.index({ gender: 1 });
StudentSchema.index({ createdAt: -1 });
StudentSchema.index({ 'academicDetails.class': 1, rollNumber: 1 }, { unique: true, sparse: true });

// Export the model
export const Student = mongoose.model<IStudent>('Student', StudentSchema);
