import { subjectConfigRepository } from './subject-config.repository';
import type { UpdateSubjectConfigDto } from './dto/subject-config.dto';

export const subjectConfigService = {
  async get() {
    return subjectConfigRepository.get();
  },

  async update(dto: UpdateSubjectConfigDto) {
    return subjectConfigRepository.update(dto);
  },

  /** Returns a map of { subjectName → fee } for active subjects of the given class. */
  async getActiveFeeMap(className: string): Promise<Record<string, number>> {
    const config = await subjectConfigRepository.get();
    const classEntry = config.classSubjects.find((c) => c.className === className);
    if (!classEntry) return {};
    const map: Record<string, number> = {};
    for (const s of classEntry.subjects) {
      if (s.isActive) map[s.name] = s.fee;
    }
    return map;
  },
};
