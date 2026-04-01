import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthUser, UserRole } from '../../models/auth.model';
import type { LoginDto } from './dto/auth.dto';

function serviceError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export const authService = {
  async login(dto: LoginDto) {
    const user = await AuthUser.findOne({ userId: dto.userId, role: dto.role as UserRole });
    if (!user) throw serviceError('Invalid userId or password', 401);

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw serviceError('Invalid userId or password', 401);

    const secret = process.env.JWT_SECRET || 'yps-academy-super-secret-jwt-key-change-in-production';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      { _id: (user._id as unknown as string).toString(), userId: user.userId, role: user.role },
      secret,
      { expiresIn }
    );

    return {
      _id: (user._id as unknown as string).toString(),
      userId: user.userId,
      email: `${dto.userId}@ypsacademy.com`,
      role: user.role,
      name: user.name,
      token,
    };
  },
};
