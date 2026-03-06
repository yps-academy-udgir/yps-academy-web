/**
 * Student Model
 * Defines the interface for student data structures
 * Matches backend Student schema
 */

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AcademicDetails {
  department: string;
  semester: number;
  gpa: number;
  enrollmentDate: Date;
}

export interface Student {
  _id?: string;
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  address: Address;
  academicDetails: AcademicDetails;
  status: 'active' | 'inactive' | 'graduated';
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * API Response wrapper
 * Standardized response format from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

/**
 * Paginated API Response
 * Used for list endpoints with pagination
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Department enum
 */
export enum Department {
  CS = 'Computer Science',
  ELECTRONICS = 'Electronics',
  MECHANICAL = 'Mechanical',
  CIVIL = 'Civil',
  ELECTRICAL = 'Electrical',
}

/**
 * Student Status enum
 */
export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
}
