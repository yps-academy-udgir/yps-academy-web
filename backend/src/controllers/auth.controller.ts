import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { successResponse, errorResponse } from '../utils/response.util';
import { AuthUser, UserRole } from '../models/auth.model';

const VALID_ROLES: UserRole[] = ['admin', 'faculty', 'student'];

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate user against DB credentials and return signed JWT
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, password, role } = req.body as { userId: string; password: string; role: string };

    if (!userId || !password || !role) {
      errorResponse(res, 'userId, password and role are required', 400);
      return;
    }

    if (!VALID_ROLES.includes(role as UserRole)) {
      errorResponse(res, 'Invalid role. Must be admin, faculty or student', 400);
      return;
    }

    const user = await AuthUser.findOne({ userId, role: role as UserRole });

    if (!user) {
      errorResponse(res, 'Invalid userId or password', 401);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      errorResponse(res, 'Invalid userId or password', 401);
      return;
    }

    const secret = process.env.JWT_SECRET || 'yps-academy-super-secret-jwt-key-change-in-production';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      { _id: (user._id as unknown as string).toString(), userId: user.userId, role: user.role },
      secret,
      { expiresIn }
    );

    successResponse(
      res,
      {
        _id: (user._id as unknown as string).toString(),
        userId: user.userId,
        email: `${userId}@ypsacademy.com`,
        role: user.role,
        name: user.name,
        token,
      },
      'Login successful'
    );
  } catch (error) {
    errorResponse(res, 'Internal server error', 500);
  }
};

/**
 * @route  GET /api/auth/verify
 * @desc   Verify JWT token validity (requires auth middleware)
 * @access Protected
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // If we reach here, the token was already verified by auth middleware
    const user = req.user;
    
    if (!user) {
      errorResponse(res, 'User not found in request', 401);
      return;
    }

    successResponse(
      res,
      {
        _id: user._id,
        userId: user.userId,
        role: user.role,
        valid: true,
      },
      'Token is valid'
    );
  } catch (error) {
    errorResponse(res, 'Token verification failed', 401);
  }
};
