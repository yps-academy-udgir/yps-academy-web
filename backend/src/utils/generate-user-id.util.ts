import { UserRole } from '../models/auth.model';

/**
 * Generates a human-readable unique userId.
 *
 * Format: {YY}-YPS-{ROLE}-{NAME}-{ROLL}
 *   YY    — last 2 digits of current year (e.g. 26)
 *   ROLE  — STUD (student) | FAC (faculty)
 *   NAME  — uppercase firstName (letters only)
 *   ROLL  — externally generated roll number (typically 3-digit, e.g. 001)
 *
 * Examples: 26-YPS-STUD-JOHN-001 | 26-YPS-FAC-RAM-002
 */
export async function generateUserId(role: UserRole, firstName: string, rollNumber: string): Promise<string> {
  const roleTag = role === 'student' ? 'STUD' : 'FAC';
  const yy = new Date().getFullYear().toString().slice(-2);
  const normalizedName = firstName
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 12);

  const namePart = normalizedName.length > 0 ? normalizedName : 'USER';
  return `${yy}-YPS-${roleTag}-${namePart}-${rollNumber}`;
}
