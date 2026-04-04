import { Student, StudentStatus } from '../../models/student.model';
import Classroom from '../../models/classroom.model';

const CLASS_ORDER = ['5th', '6th', '7th', '8th', '9th', '10th'] as const;
type ClassValue = typeof CLASS_ORDER[number];

function nextClass(cls: ClassValue): ClassValue | null {
  const idx = CLASS_ORDER.indexOf(cls);
  if (idx === -1 || idx === CLASS_ORDER.length - 1) return null;
  return CLASS_ORDER[idx + 1];
}

export const academicYearRepository = {
  /** Count active students per class */
  async getActiveCountsByClass(): Promise<Record<string, number>> {
    const results = await Student.aggregate([
      { $match: { status: StudentStatus.ACTIVE } },
      { $group: { _id: '$academicDetails.class', count: { $sum: 1 } } },
    ]);
    return Object.fromEntries(results.map((r: any) => [r._id, r.count]));
  },

  /** Count active 10th students (to-graduate) */
  async countToGraduate(): Promise<number> {
    return Student.countDocuments({ 'academicDetails.class': '10th', status: StudentStatus.ACTIVE });
  },

  /** Find classrooms for a given academic year indexed by class */
  async getClassroomsForYear(academicYear: string): Promise<Record<string, any[]>> {
    const rooms = await Classroom.find({ academicYear }).lean();
    const map: Record<string, any[]> = {};
    for (const room of rooms) {
      const cls = room.class as string;
      if (!map[cls]) map[cls] = [];
      map[cls].push(room);
    }
    return map;
  },

  /** Fetch all active students (except 10th) with their classroom section for auto-mapping */
  async getActiveStudentsExcept10th(): Promise<any[]> {
    return Student.find({
      status: StudentStatus.ACTIVE,
      'academicDetails.class': { $ne: '10th' },
    }).lean();
  },

  /** Fetch active 10th students */
  async getActive10thStudents(): Promise<any[]> {
    return Student.find({
      status: StudentStatus.ACTIVE,
      'academicDetails.class': '10th',
    }).lean();
  },

  /** Get classroom section string from ObjectId (for section-matching) */
  async getClassroomSection(classroomId: string): Promise<string | null> {
    const room = await Classroom.findById(classroomId).select('section').lean();
    return room ? (room as any).section : null;
  },

  /** Promote a batch of students (not 10th) */
  async promoteStudents(
    students: any[],
    newAcademicYear: string,
    newRoomMap: Record<string, string | null>,  // studentId → new classroomId | null
    newClassMap: Record<string, string>,         // studentId → nextClass
    roomNameMap: Record<string, string>,         // studentId → classroomName for history
  ): Promise<void> {
    const now = new Date();
    const ops = students.map((s) => {
      const historyEntry = {
        academicYear: s.academicDetails?.yearOfAdmission ?? newAcademicYear,
        class: s.academicDetails?.class,
        classroomId: s.academicDetails?.classroomId ?? undefined,
        classroomName: roomNameMap[s._id.toString()] ?? undefined,
        subjects: s.academicDetails?.subjects ?? [],
        promotedAt: now,
      };
      return {
        updateOne: {
          filter: { _id: s._id },
          update: {
            $push: { academicHistory: historyEntry },
            $set: {
              'academicDetails.class': newClassMap[s._id.toString()],
              'academicDetails.classroomId': newRoomMap[s._id.toString()] ?? undefined,
            },
          },
        },
      };
    });
    if (ops.length) await Student.bulkWrite(ops as any[]);
  },

  /** Graduate 10th students → mark alumni */
  async graduateStudents(students: any[]): Promise<void> {
    const now = new Date();
    const ops = students.map((s) => {
      const historyEntry = {
        academicYear: s.academicDetails?.yearOfAdmission ?? '',
        class: s.academicDetails?.class,
        classroomId: s.academicDetails?.classroomId ?? undefined,
        classroomName: undefined,
        subjects: s.academicDetails?.subjects ?? [],
        promotedAt: now,
      };
      return {
        updateOne: {
          filter: { _id: s._id },
          update: {
            $push: { academicHistory: historyEntry },
            $set: { status: StudentStatus.ALUMNI },
          },
        },
      };
    });
    if (ops.length) await Student.bulkWrite(ops as any[]);
  },
};

export { nextClass, CLASS_ORDER, type ClassValue };
