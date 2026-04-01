import { Request, Response } from 'express';
import { authService } from './auth.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { loginSchema } from './dto/auth.dto';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, parsed.error.issues.map(i => i.message).join(', '), 400);
      return;
    }
    const data = await authService.login(parsed.data);
    successResponse(res, data, 'Login successful');
  } catch (error: any) {
    if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
    errorResponse(res, 'Internal server error', 500);
  }
};

export const verifyTokenController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) { errorResponse(res, 'User not found in request', 401); return; }

    successResponse(res, { _id: user._id, userId: user.userId, role: user.role, valid: true }, 'Token is valid');
  } catch (error) {
    errorResponse(res, 'Token verification failed', 401);
  }
};
