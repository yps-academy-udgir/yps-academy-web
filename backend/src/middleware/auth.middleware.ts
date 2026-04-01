import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.util';
import { UserRole } from '../models/auth.model';

export interface AuthPayload {
  _id: string;
  userId: string;
  role: UserRole;
  isFirstLogin?: boolean;
}

// Extend Express Request to carry decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Access denied. No token provided.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'yps-academy-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    errorResponse(res, 'Invalid or expired token. Please login again.', 401);
  }
};

/**
 * Middleware factory — restricts a route to specific roles.
 * Usage: requireRoles('admin', 'faculty')
 */
export const requireRoles = (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Forbidden: insufficient permissions', 403);
      return;
    }
    next();
  };

