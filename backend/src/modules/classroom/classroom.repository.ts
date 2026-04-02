import { FilterQuery, isValidObjectId } from 'mongoose';
import Classroom, { IClassroom } from '../../models/classroom.model';
import { Student } from '../../models/student.model';
import { Faculty } from '../../models/faculty.model';
import { AuthUser } from '../../models/auth.model';

export interface ClassroomFilter {
  class?: string;
  section?: string;
  academicYear?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export const classroomRepository = {
  async findAll(filter: ClassroomFilter, { page, limit }: PaginationOptions) {
    const query: FilterQuery<IClassroom> = {};

    if (filter.class) query.class = filter.class;
    if (filter.section) query.section = filter.section.toUpperCase();
    if (filter.academicYear) query.academicYear = filter.academicYear;
    if (filter.search) query.roomNumber = { $regex: filter.search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [classrooms, total] = await Promise.all([
      Classroom.find(query)
        .populate('facultyAssignments.facultyId', 'firstName lastName email speciality userId rollNumber')
        .populate('enrolledStudents', 'firstName lastName email rollNumber userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Classroom.countDocuments(query),
    ]);

    return { classrooms, total };
  },

  async findById(id: string) {
    return Classroom.findById(id)
      .populate('facultyAssignments.facultyId', 'firstName lastName email contact department speciality userId rollNumber')
      .populate('enrolledStudents', 'firstName lastName email contact academicDetails rollNumber userId')
      .lean();
  },

  async findByIdDoc(id: string) {
    return Classroom.findById(id);
  },

  async findDuplicate(classValue: string, section: string, academicYear: string, excludeId?: string) {
    const query: FilterQuery<IClassroom> = { class: classValue, section: section.toUpperCase(), academicYear };
    if (excludeId) query._id = { $ne: excludeId };
    return Classroom.findOne(query).lean();
  },

  async findFirstAvailableByClass(classValue: string) {
    return Classroom.findOne({
      class: classValue,
      $expr: { $lt: [{ $size: '$enrolledStudents' }, '$capacity'] },
    })
      .sort({ academicYear: -1, section: 1, createdAt: 1 })
      .lean();
  },

  async findByUser(userId: string, role: 'student' | 'faculty') {
    const baseQuery = {
      $or: [
        { userId },
        { rollNumber: userId },
      ],
    } as any;

    if (isValidObjectId(userId)) {
      baseQuery.$or.push({ _id: userId });
    }

    let entity = role === 'student'
      ? await Student.findOne(baseQuery).select('_id').lean()
      : await Faculty.findOne(baseQuery).select('_id').lean();

    if (!entity?._id) {
      const authUser = await AuthUser.findOne({ userId, role }).select('name').lean();
      const name = authUser?.name?.trim();
      if (name) {
        const [firstName, ...rest] = name.split(/\s+/);
        const lastName = rest.join(' ');
        const fallbackNameQuery: any = {
          firstName: new RegExp(`^${escapeRegex(firstName)}$`, 'i'),
        };
        if (lastName) {
          fallbackNameQuery.lastName = new RegExp(`^${escapeRegex(lastName)}$`, 'i');
        }

        entity = role === 'student'
          ? await Student.findOne(fallbackNameQuery).select('_id').lean()
          : await Faculty.findOne(fallbackNameQuery).select('_id').lean();
      }
    }

    const query: FilterQuery<IClassroom> = role === 'student'
      ? {
          $or: [
            ...(entity?._id ? [{ enrolledStudents: entity._id }] : []),
            { enrolledStudents: userId as any },
          ],
        }
      : {
          $or: [
            ...(entity?._id ? [{ 'facultyAssignments.facultyId': entity._id }] : []),
            { 'facultyAssignments.facultyId': userId as any },
          ],
        };

    return Classroom.find(query)
      .select('class section roomNumber academicYear capacity enrolledStudents')
      .sort({ academicYear: -1, class: 1, section: 1 })
      .lean();
  },

  async create(data: Record<string, unknown>) {
    const classroom = new Classroom(data);
    return classroom.save();
  },

  async update(id: string, data: Record<string, unknown>) {
    return Classroom.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('facultyAssignments.facultyId', 'firstName lastName email speciality userId rollNumber')
      .populate('enrolledStudents', 'firstName lastName email rollNumber userId');
  },

  async delete(id: string) {
    return Classroom.findByIdAndDelete(id);
  },

  async findByIdWithSchedule(id: string) {
    return Classroom.findById(id)
      .select('weeklySchedule class section')
      .populate('weeklySchedule.facultyId', 'firstName lastName email speciality')
      .lean();
  },

  async getStats() {
    const [totalClassrooms, classroomsByClass, totalCapacity, totalEnrolled] = await Promise.all([
      Classroom.countDocuments(),
      Classroom.aggregate([
        { $group: { _id: '$class', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Classroom.aggregate([{ $group: { _id: null, total: { $sum: '$capacity' } } }]),
      Classroom.aggregate([
        { $project: { enrolledCount: { $size: '$enrolledStudents' } } },
        { $group: { _id: null, total: { $sum: '$enrolledCount' } } },
      ]),
    ]);

    return {
      totalClassrooms,
      byClass: classroomsByClass,
      totalCapacity: totalCapacity[0]?.total || 0,
      totalEnrolled: totalEnrolled[0]?.total || 0,
      occupancyRate:
        totalCapacity[0]?.total > 0
          ? ((totalEnrolled[0]?.total || 0) / totalCapacity[0].total) * 100
          : 0,
    };
  },
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
