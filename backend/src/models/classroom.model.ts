/**
 * Classroom Model
 * Mongoose schema for Classroom entity with faculty assignments, student enrollment, and weekly schedule
 */

import mongoose, { Schema, Document } from 'mongoose';

// Class enum (5th to 10th)
export enum Class {
  FIFTH = '5th',
  SIXTH = '6th',
  SEVENTH = '7th',
  EIGHTH = '8th',
  NINTH = '9th',
  TENTH = '10th',
}

// Day enum for weekly schedule
export enum Day {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
}

// Subject enum (aligned with Faculty speciality and Student subjects)
export enum Subject {
  MATHEMATICS = 'Mathematics',
  SCIENCE = 'Science',
  ENGLISH = 'English',
}

// Faculty Assignment Interface
export interface IFacultyAssignment {
  facultyId: mongoose.Types.ObjectId;
  subject: Subject;
  isPrimary: boolean; // Primary class teacher
}

// Schedule Slot Interface
export interface IScheduleSlot {
  day: Day;
  period: number; // 1-8
  subject: Subject;
  facultyId: mongoose.Types.ObjectId;
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "09:45"
}

// Classroom Document Interface
export interface IClassroom extends Document {
  class: Class;
  section: string; // A, B, C, etc.
  roomNumber: string;
  capacity: number;
  academicYear: string; // e.g., "2025-2026"
  facultyAssignments: IFacultyAssignment[];
  enrolledStudents: mongoose.Types.ObjectId[];
  weeklySchedule: IScheduleSlot[];
  createdAt: Date;
  updatedAt: Date;
}

// Faculty Assignment Schema (no _id)
const FacultyAssignmentSchema = new Schema<IFacultyAssignment>(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty ID is required'],
    },
    subject: {
      type: String,
      enum: Object.values(Subject),
      required: [true, 'Subject is required'],
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Schedule Slot Schema (no _id)
const ScheduleSlotSchema = new Schema<IScheduleSlot>(
  {
    day: {
      type: String,
      enum: Object.values(Day),
      required: [true, 'Day is required'],
    },
    period: {
      type: Number,
      required: [true, 'Period is required'],
      min: [1, 'Period must be between 1 and 8'],
      max: [8, 'Period must be between 1 and 8'],
    },
    subject: {
      type: String,
      enum: Object.values(Subject),
      required: [true, 'Subject is required'],
    },
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty ID is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format'],
    },
  },
  { _id: false }
);

// Classroom Schema
const ClassroomSchema = new Schema<IClassroom>(
  {
    class: {
      type: String,
      enum: {
        values: Object.values(Class),
        message: 'Class must be one of: 5th, 6th, 7th, 8th, 9th, 10th',
      },
      required: [true, 'Class is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
      uppercase: true,
      match: [/^[A-Z]$/, 'Section must be a single letter (A-Z)'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in YYYY-YYYY format (e.g., 2025-2026)'],
    },
    facultyAssignments: {
      type: [FacultyAssignmentSchema],
      default: [],
    },
    enrolledStudents: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
      default: [],
    },
    weeklySchedule: {
      type: [ScheduleSlotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ClassroomSchema.index({ class: 1, section: 1, academicYear: 1 }, { unique: true }); // Unique classroom per academic year
ClassroomSchema.index({ academicYear: 1 }); // Filter by year
ClassroomSchema.index({ roomNumber: 1 }); // Search by room
ClassroomSchema.index({ 'facultyAssignments.facultyId': 1 }); // Find classrooms by faculty
ClassroomSchema.index({ enrolledStudents: 1 }); // Find classroom by student

// Export model
const Classroom = mongoose.model<IClassroom>('Classroom', ClassroomSchema);
export default Classroom;
