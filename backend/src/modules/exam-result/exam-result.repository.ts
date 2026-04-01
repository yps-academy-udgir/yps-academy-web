import { ExamResult, IExamResult } from '../../models/exam-result.model';

export const examResultRepository = {
  async findByStudent(studentId: string) {
    return ExamResult.find({ studentId }).sort({ year: -1, month: -1 }).lean();
  },

  async findById(id: string) {
    return ExamResult.findById(id).lean();
  },

  async findByIdDoc(id: string) {
    return ExamResult.findById(id);
  },

  async findOne(studentId: string, examType: string, month: number, year: number) {
    return ExamResult.findOne({ studentId, examType, month, year });
  },

  async create(data: Partial<IExamResult>) {
    const doc = new ExamResult(data);
    return doc.save();
  },

  async delete(id: string) {
    return ExamResult.findByIdAndDelete(id);
  },

  async findByStudentIds(
    studentIds: string[],
    filter: { examType?: string; month?: number; year?: number }
  ) {
    const query: Record<string, unknown> = { studentId: { $in: studentIds } };
    if (filter.examType) query['examType'] = filter.examType;
    if (filter.month) query['month'] = filter.month;
    if (filter.year) query['year'] = filter.year;

    return ExamResult.find(query)
      .populate('studentId', 'firstName lastName')
      .lean();
  },
};
