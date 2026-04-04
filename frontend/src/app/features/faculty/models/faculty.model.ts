/**
 * Faculty Model
 * Data structure for faculty members
 * Matches backend Faculty schema
 */

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

export interface PastExperience {
  organization: string;
  role: string;
  yearsOfExperience: number;
}

export interface SalaryPayment {
  date: string;
  amount: number;
  note?: string;
}

export interface Faculty {
  _id?: string;
  userId?: string;
  rollNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  department: Department;
  speciality: Speciality;
  degree: string;
  yearsOfExperience: number;
  pastExperience: PastExperience[];
  annualSalary: number;
  salaryPayments: SalaryPayment[];
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
