/**
 * Classroom Model
 * Frontend TypeScript interfaces for classroom module
 */

// Reuse enums from student model
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

// Subject enum (aligned with Faculty and Student)
export enum Subject {
  MATHEMATICS = 'Mathematics',
  SCIENCE = 'Science',
  ENGLISH = 'English',
}

/**
 * Faculty Assignment Interface
 */
export interface FacultyAssignment {
  facultyId: string | FacultyInfo;
  subject: Subject;
  isPrimary: boolean;
}

/**
 * Faculty Info (populated)
 */
export interface FacultyInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  speciality: string;
}

/**
 * Student Info (populated)
 */
export interface StudentInfo {
  _id: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  contact?: string;
  academicDetails?: any;
}

/**
 * Schedule Slot Interface
 */
export interface ScheduleSlot {
  day: Day;
  period: number; // 1-8
  subject: Subject;
  facultyId: string | FacultyInfo;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

/**
 * Classroom Interface
 */
export interface Classroom {
  _id?: string;
  class: Class;
  section: string; // A, B, C, etc.
  roomNumber: string;
  capacity: number;
  academicYear: string; // "2025-2026"
  facultyAssignments: FacultyAssignment[];
  enrolledStudents: (string | StudentInfo)[];
  weeklySchedule: ScheduleSlot[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Classroom Stats Interface
 */
export interface ClassroomStats {
  totalClassrooms: number;
  byClass: { _id: string; count: number }[];
  totalCapacity: number;
  totalEnrolled: number;
  occupancyRate: number;
}

/**
 * Helper function to get display name for Class enum
 */
export function getClassDisplayName(classValue: Class): string {
  return classValue;
}

/**
 * Helper function to get section display (uppercase)
 */
export function getSectionDisplay(section: string): string {
  return section.toUpperCase();
}

/**
 * Helper function to calculate occupancy percentage
 */
export function getOccupancyPercentage(enrolled: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.round((enrolled / capacity) * 100);
}

/**
 * Helper function to get occupancy color (for UI indicators)
 */
export function getOccupancyColor(occupancyPercentage: number): string {
  if (occupancyPercentage < 80) return 'green';
  if (occupancyPercentage < 95) return 'yellow';
  return 'red';
}

/**
 * Helper function to format classroom full name
 */
export function getClassroomFullName(classroom: Classroom): string {
  return `${getClassDisplayName(classroom.class)} ${getSectionDisplay(classroom.section)}`;
}

/**
 * Helper function to get enrolled count
 */
export function getEnrolledCount(classroom: Classroom): number {
  return classroom.enrolledStudents.length;
}

/**
 * Helper function to get available seats
 */
export function getAvailableSeats(classroom: Classroom): number {
  return Math.max(0, classroom.capacity - classroom.enrolledStudents.length);
}
