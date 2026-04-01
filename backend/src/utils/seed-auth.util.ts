import bcrypt from 'bcrypt';
import { AuthUser } from '../models/auth.model';

const SALT_ROUNDS = 10;

const DEFAULT_USERS = [
  { userId: 'admin',   password: 'admin',   role: 'admin'   as const, name: 'Administrator' },
  { userId: 'faculty', password: 'faculty', role: 'faculty' as const, name: 'Faculty User'  },
  { userId: 'student', password: 'student', role: 'student' as const, name: 'Student User'  },
];

export const seedAuthUsers = async (): Promise<void> => {
  try {
    for (const user of DEFAULT_USERS) {
      const exists = await AuthUser.findOne({ userId: user.userId, role: user.role });
      if (!exists) {
        const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
        await AuthUser.create({ userId: user.userId, passwordHash, role: user.role, name: user.name, isFirstLogin: false });
        console.log(`✓ Seeded auth user: ${user.userId} (${user.role})`);
      }
    }
  } catch (error) {
    console.error('✗ Failed to seed auth users:', error);
  }
};
