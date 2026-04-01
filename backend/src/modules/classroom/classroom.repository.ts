import { FilterQuery } from 'mongoose';
import Classroom, { IClassroom } from '../../models/classroom.model';

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
        .populate('facultyAssignments.facultyId', 'firstName lastName email speciality')
        .populate('enrolledStudents', 'firstName lastName email')
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
      .populate('facultyAssignments.facultyId', 'firstName lastName email contact department speciality')
      .populate('enrolledStudents', 'firstName lastName email contact academicDetails')
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

  async create(data: Record<string, unknown>) {
    const classroom = new Classroom(data);
    return classroom.save();
  },

  async update(id: string, data: Record<string, unknown>) {
    return Classroom.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('facultyAssignments.facultyId', 'firstName lastName email speciality')
      .populate('enrolledStudents', 'firstName lastName email');
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
