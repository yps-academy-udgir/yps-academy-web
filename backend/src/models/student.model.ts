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
  OTHER = 'other',
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

// Academic Details Interface
export interface IAcademicDetails {
  yearOfAdmission: number;
  class: Class;
  subjects: string[]; // Array to allow predefined + custom subjects
  selfStudyMode: boolean;
}

// Student Interface
export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  gender: Gender;
  academicDetails?: IAcademicDetails;
  createdAt: Date;
  updatedAt: Date;
}

// Academic Details Schema
const AcademicDetailsSchema = new Schema({
  yearOfAdmission: {
    type: Number,
    required: false,
    min: [1900, 'Year of admission must be after 1900'],
    max: [new Date().getFullYear() + 10, 'Year of admission cannot be too far in the future'],
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
}, { _id: false }); // Don't create _id for subdocument

// Student Schema
const StudentSchema: Schema = new Schema(
  {
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
        values: [Gender.MALE, Gender.FEMALE, Gender.OTHER],
        message: '{VALUE} is not a valid gender',
      },
    },
    academicDetails: AcademicDetailsSchema,
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

// Export the model
export const Student = mongoose.model<IStudent>('Student', StudentSchema);
