import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'faculty' | 'student';

export interface IAuthUser extends Document {
  userId: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  isFirstLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuthUserSchema = new Schema<IAuthUser>(
  {
    userId: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
    name: { type: String, required: true },
    isFirstLogin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound unique index: same userId can exist for different roles
AuthUserSchema.index({ userId: 1, role: 1 }, { unique: true });

export const AuthUser = mongoose.model<IAuthUser>('AuthUser', AuthUserSchema);
