import { SequenceCounter } from '../models/sequence-counter.model';

function normalizeClassKey(classValue: string): string {
  return classValue.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

async function getNextSequence(key: string): Promise<number> {
  const updated = await SequenceCounter.findOneAndUpdate(
    { key },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return updated?.value ?? 1;
}

export async function generateStudentRollNumber(classValue: string): Promise<string> {
  const key = `student:${normalizeClassKey(classValue)}`;
  const seq = await getNextSequence(key);
  return String(seq).padStart(3, '0');
}

export async function generateFacultyRollNumber(): Promise<string> {
  const seq = await getNextSequence('faculty:global');
  return String(seq).padStart(3, '0');
}
