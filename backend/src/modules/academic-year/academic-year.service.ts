import { academicYearRepository, nextClass, CLASS_ORDER, type ClassValue } from './academic-year.repository';
import type { PromoteDto } from './dto/academic-year.dto';

function serviceError(message: string, statusCode: number) {
  return Object.assign(new Error(message), { statusCode });
}

export const academicYearService = {
  async getPromotionPreview(newAcademicYear: string) {
    const [counts, toGraduate, newRooms] = await Promise.all([
      academicYearRepository.getActiveCountsByClass(),
      academicYearRepository.countToGraduate(),
      academicYearRepository.getClassroomsForYear(newAcademicYear),
    ]);

    const blocked: { class: string; reason: string }[] = [];
    let toPromote = 0;

    // Check 5th-9th — each needs a next-class classroom in newAcademicYear
    for (const cls of CLASS_ORDER.slice(0, -1) as ClassValue[]) {
      const count = counts[cls] ?? 0;
      if (count === 0) continue;
      toPromote += count;
      const next = nextClass(cls)!;
      if (!newRooms[next] || newRooms[next].length === 0) {
        blocked.push({ class: cls, reason: `No ${next} classroom found for ${newAcademicYear}` });
      }
    }

    return {
      newAcademicYear,
      toPromote,
      toGraduate,
      blocked,
      canProceed: blocked.length === 0,
    };
  },

  async promote(dto: PromoteDto) {
    const preview = await academicYearService.getPromotionPreview(dto.newAcademicYear);
    if (!preview.canProceed) {
      throw serviceError(
        `Cannot promote: ${preview.blocked.map((b) => b.reason).join('; ')}`,
        409
      );
    }

    const [studentsToPromote, studentsToGraduate, newRooms] = await Promise.all([
      academicYearRepository.getActiveStudentsExcept10th(),
      academicYearRepository.getActive10thStudents(),
      academicYearRepository.getClassroomsForYear(dto.newAcademicYear),
    ]);

    // Build per-student maps
    const newRoomMap: Record<string, string | null> = {};
    const newClassMap: Record<string, string> = {};
    const roomNameMap: Record<string, string> = {};

    for (const student of studentsToPromote) {
      const sid = student._id.toString();
      const currentClass = student.academicDetails?.class as ClassValue;
      const next = nextClass(currentClass)!;
      newClassMap[sid] = next;

      const candidates = newRooms[next] ?? [];
      if (candidates.length === 0) {
        newRoomMap[sid] = null;
        continue;
      }

      // Auto-map: match section of old classroom, fallback to first alphabetically
      let matched = candidates[0];
      if (student.academicDetails?.classroomId) {
        const oldSection = await academicYearRepository.getClassroomSection(
          student.academicDetails.classroomId.toString()
        );
        if (oldSection) {
          const sectionMatch = candidates.find(
            (r: any) => r.section.toUpperCase() === oldSection.toUpperCase()
          );
          if (sectionMatch) matched = sectionMatch;
        }
      } else {
        // No old room → first alphabetically
        matched = candidates.sort((a: any, b: any) => a.section.localeCompare(b.section))[0];
      }

      newRoomMap[sid] = matched._id.toString();
      roomNameMap[sid] = `${next}-${matched.section}`;
    }

    // Build roomNameMap for current rooms (for history snapshot)
    for (const student of studentsToPromote) {
      const sid = student._id.toString();
      if (!roomNameMap[sid] && student.academicDetails?.classroomId) {
        // Use old room name for the history entry classroomName
      }
    }

    await Promise.all([
      academicYearRepository.promoteStudents(
        studentsToPromote,
        dto.newAcademicYear,
        newRoomMap,
        newClassMap,
        roomNameMap,
      ),
      academicYearRepository.graduateStudents(studentsToGraduate),
    ]);

    return {
      promoted: studentsToPromote.length,
      graduated: studentsToGraduate.length,
      newAcademicYear: dto.newAcademicYear,
    };
  },
};
