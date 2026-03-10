import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.util';
import { UserRole } from '../models/auth.model';

export interface AuthPayload {
  _id: string;
  userId: string;
  role: UserRole;
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

  // Debug logging
  console.log(`[Auth Middleware] ${req.method} ${req.path}`);
  console.log(`[Auth Middleware] Authorization header:`, authHeader ? 'Present' : 'Missing');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[Auth Middleware] No token provided or invalid format');
    errorResponse(res, 'Access denied. No token provided.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  console.log('[Auth Middleware] Token extracted, length:', token?.length || 0);

  try {
    const secret = process.env.JWT_SECRET || 'yps-academy-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;
    console.log('[Auth Middleware] Token verified successfully for user:', decoded.userId);
    next();
  } catch (err) {
    console.error('[Auth Middleware] Token verification failed:', (err as Error).message);
    errorResponse(res, 'Invalid or expired token. Please login again.', 401);
  }
};

