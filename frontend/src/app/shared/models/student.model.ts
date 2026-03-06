/**
 * Student Model
 * Simplified student data structure
 * Matches backend Student schema
 */

export interface Student {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  gender: 'male' | 'female' | 'other';
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
 * Gender enum
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
