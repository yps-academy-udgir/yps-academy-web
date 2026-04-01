import mongoose from 'mongoose';
import { examResultRepository } from './exam-result.repository';
import Classroom from '../../models/classroom.model';
import type { CreateExamResultDto, UpdateExamResultDto, BulkExamResultDto } from './dto/exam-result.dto';

function serviceError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export const examResultService = {
  async create(dto: CreateExamResultDto) {
    const existing = await examResultRepository.findOne(dto.studentId, dto.examType, dto.month, dto.year);
    if (existing) {
      throw serviceError(
        `Marks for ${dto.examType} - ${dto.month}/${dto.year} already exist for this student. Use update instead.`,
        409
      );
    }
    return examResultRepository.create(dto as any);
  },

  async getByStudent(studentId: string) {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw serviceError('Valid studentId query param is required', 400);
    }
    return examResultRepository.findByStudent(studentId);
  },

  async getById(id: string) {
    return examResultRepository.findById(id);
  },

  async update(id: string, dto: UpdateExamResultDto) {
    const doc = await examResultRepository.findByIdDoc(id);
    if (!doc) throw serviceError('Exam result not found', 404);

    if (dto.examType) doc.examType = dto.examType as any;
    if (dto.month !== undefined) doc.month = dto.month;
    if (dto.year !== undefined) doc.year = dto.year;
    if (dto.subjectMarks) doc.subjectMarks = dto.subjectMarks as any;

    return doc.save();
  },

  async delete(id: string) {
    const result = await examResultRepository.delete(id);
    if (!result) throw serviceError('Exam result not found', 404);
    return result;
  },

  async bulkSave(dto: BulkExamResultDto) {
    const saved = await Promise.all(
      dto.records.map(async record => {
        let doc = await examResultRepository.findOne(record.studentId, dto.examType, dto.month, dto.year);
        if (doc) {
          doc.subjectMarks = record.subjectMarks as any;
        } else {
          doc = await examResultRepository.create({
            studentId: record.studentId as any,
            examType: dto.examType as any,
            month: dto.month,
            year: dto.year,
            subjectMarks: record.subjectMarks as any,
          });
          return doc;
        }
        return doc.save();
      })
    );
    return { count: saved.length };
  },

  async getByClassroom(
    classroomId: string,
    filter: { examType?: string; month?: number; year?: number }
  ) {
    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      throw serviceError('Invalid classroomId', 400);
    }

    const classroom = await Classroom.findById(classroomId).select('enrolledStudents').lean();
    if (!classroom) throw serviceError('Classroom not found', 404);

    return examResultRepository.findByStudentIds(
      classroom.enrolledStudents.map(String),
      filter
    );
  },

  async getFiltered(
    classValue: string,
    section?: string,
    examType?: string,
    month?: number,
    year?: number
  ) {
    if (!classValue) throw serviceError('class query param is required', 400);

    const classroomFilter: Record<string, unknown> = { class: classValue };
    if (section) classroomFilter['section'] = section;

    const classrooms = await Classroom.find(classroomFilter)
      .select('class section roomNumber enrolledStudents')
      .lean();

    if (classrooms.length === 0) return [];

    const studentToClassroom = new Map<string, { class: string; section: string; roomNumber: string }>();
    const studentIds: mongoose.Types.ObjectId[] = [];

    for (const classroom of classrooms) {
      for (const sid of classroom.enrolledStudents) {
        const studentId = String(sid);
        if (!studentToClassroom.has(studentId)) {
          studentToClassroom.set(studentId, {
            class: classroom.class,
            section: classroom.section,
            roomNumber: classroom.roomNumber,
          });
          studentIds.push(new mongoose.Types.ObjectId(studentId));
        }
      }
    }

    const results = await examResultRepository.findByStudentIds(
      studentIds.map(String),
      { examType, month, year }
    );

    return results.map(result => {
      const sid = String(
        result.studentId && typeof result.studentId === 'object'
          ? (result.studentId as any)._id
          : result.studentId
      );
      const classroom = studentToClassroom.get(sid);
      const student = result.studentId as any;

      return {
        _id: result._id,
        studentId: sid,
        studentName: student ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() : 'Unknown',
        class: classroom?.class ?? classValue,
        section: classroom?.section ?? '-',
        roomNumber: classroom?.roomNumber ?? '-',
        examType: result.examType,
        month: result.month,
        year: result.year,
        subjectMarks: result.subjectMarks,
        totalMarksObtained: result.totalMarksObtained,
        totalOutOf: result.totalOutOf,
        percentage: result.percentage,
      };
    });
  },
};
