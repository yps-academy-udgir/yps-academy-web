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

// Student Interface
export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  gender: Gender;
  createdAt: Date;
  updatedAt: Date;
}

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
