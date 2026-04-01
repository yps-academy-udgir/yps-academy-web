import bcrypt from 'bcrypt';
import { AuthUser, UserRole } from '../models/auth.model';

const SALT_ROUNDS = 10;
export const DEFAULT_PASSWORD = 'YPS@123';

/**
 * Creates an AuthUser account for a newly created student or faculty.
 * userId is a pre-generated human-readable ID (e.g. YPSS26JOH001).
 */
export async function createAuthUser(
  userId: string,
  name: string,
  role: UserRole
): Promise<{ userId: string; defaultPassword: string }> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  await AuthUser.create({ userId, passwordHash, role, name, isFirstLogin: true });
  return { userId, defaultPassword: DEFAULT_PASSWORD };
}

/**
 * Deletes the AuthUser account linked to an entity.
 * Called when a student or faculty is deleted.
 */
export async function deleteAuthUser(entityId: string, role: UserRole): Promise<void> {
  await AuthUser.deleteOne({ userId: entityId, role });
}

/**
 * Resets the AuthUser password back to the default and marks isFirstLogin = true.
 * Called by admin when resetting a user's credentials.
 */
export async function resetAuthUser(
  entityId: string,
  role: UserRole
): Promise<{ userId: string; defaultPassword: string }> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  await AuthUser.findOneAndUpdate(
    { userId: entityId, role },
    { passwordHash, isFirstLogin: true }
  );
  return { userId: entityId, defaultPassword: DEFAULT_PASSWORD };
}
