import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthUser, UserRole } from '../../models/auth.model';
import { resetAuthUser } from '../../utils/auth-user.util';
import type { LoginDto, ChangePasswordDto, ResetPasswordDto } from './dto/auth.dto';

const SALT_ROUNDS = 10;

function serviceError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export const authService = {
  async login(dto: LoginDto) {
    const user = await AuthUser.findOne({ userId: dto.userId });
    if (!user) throw serviceError('Invalid userId or password', 401);

    if (user.role !== (dto.role as UserRole)) {
      throw serviceError('Selected role does not match this account. Please choose your correct role.', 401);
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw serviceError('Invalid userId or password', 401);

    const secret = process.env.JWT_SECRET || 'yps-academy-super-secret-jwt-key-change-in-production';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'];

    const token = jwt.sign(
      { _id: (user._id as unknown as string).toString(), userId: user.userId, role: user.role, name: user.name, isFirstLogin: user.isFirstLogin },
      secret,
      { expiresIn }
    );

    return {
      _id: (user._id as unknown as string).toString(),
      userId: user.userId,
      email: `${dto.userId}@ypsacademy.com`,
      role: user.role,
      name: user.name,
      isFirstLogin: user.isFirstLogin,
      token,
    };
  },

  async changePassword(authUserId: string, role: UserRole, dto: ChangePasswordDto) {
    const user = await AuthUser.findOne({ userId: authUserId, role });
    if (!user) throw serviceError('User not found', 404);

    const match = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!match) throw serviceError('Current password is incorrect', 400);

    user.passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    user.isFirstLogin = false;
    await user.save();
  },

  async resetPassword(dto: ResetPasswordDto) {
    const result = await resetAuthUser(dto.entityId, dto.role as UserRole);
    return result;
  },
};

