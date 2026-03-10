export enum UserRole {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student',
}

export interface LoginRequest {
  userId: string;
  password: string;
  role: UserRole;
}

export interface AuthUser {
  _id: string;
  userId?: string; // Optional for backward compatibility
  email: string;
  role: UserRole;
  name: string;
  token: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}
