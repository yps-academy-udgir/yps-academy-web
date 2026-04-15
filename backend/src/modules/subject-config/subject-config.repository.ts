import { SubjectConfig } from '../../models/subject-config.model';
import type { UpdateSubjectConfigDto } from './dto/subject-config.dto';

export const subjectConfigRepository = {
  /** Returns the single config document, creating a blank one if absent. */
  async get() {
    let config = await SubjectConfig.findOne().lean();
    if (!config) {
      await SubjectConfig.create({
        classSubjects: [],
        selfStudyFee: 0,
      });
      config = await SubjectConfig.findOne().lean();
    } else if (!config.classSubjects) {
      // Migrate legacy document: classSubjects field missing — set to empty array
      await SubjectConfig.updateOne(
        { _id: config._id },
        { $set: { classSubjects: [] } }
      );
      config = await SubjectConfig.findOne().lean();
    }
    return config!;
  },

  async update(dto: UpdateSubjectConfigDto) {
    let config = await SubjectConfig.findOne();
    if (!config) {
      return SubjectConfig.create({ classSubjects: dto.classSubjects, selfStudyFee: dto.selfStudyFee });
    }
    config.classSubjects = dto.classSubjects as any;
    config.selfStudyFee = dto.selfStudyFee;
    return config.save();
  },
};
