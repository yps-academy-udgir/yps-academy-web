import { FilterQuery } from 'mongoose';
import { Student, IStudent } from '../../models/student.model';

export interface StudentFilter {
  gender?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export const studentRepository = {
  async findAll(filter: StudentFilter, { page, limit }: PaginationOptions) {
    const query: FilterQuery<IStudent> = {};

    if (filter.gender) query.gender = filter.gender as any;

    if (filter.search) {
      query.$or = [
        { firstName: { $regex: filter.search, $options: 'i' } },
        { lastName: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { contact: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(query),
    ]);

    return { students, total };
  },

  async findById(id: string) {
    return Student.findById(id).lean();
  },

  async findByUserId(userId: string) {
    return Student.findOne({ userId }).lean();
  },

  async findByEmail(email: string, excludeId?: string) {
    const query: FilterQuery<IStudent> = { email };
    if (excludeId) query._id = { $ne: excludeId };
    return Student.findOne(query).lean();
  },

  async create(data: Record<string, unknown>) {
    return Student.create(data);
  },

  async update(id: string, data: Record<string, unknown>) {
    return Student.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  },

  async delete(id: string) {
    return Student.findByIdAndDelete(id);
  },

  async findByIdDoc(id: string) {
    return Student.findById(id);
  },

  async getStats() {
    const [total, maleCount, femaleCount] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ gender: 'male' }),
      Student.countDocuments({ gender: 'female' }),
    ]);
    return { total, byGender: { male: maleCount, female: femaleCount } };
  },

  async getFeesSummary() {
    return Student.find(
      {},
      'academicDetails.class feeDetails.totalFees feeDetails.paidAmount feeDetails.pendingFees'
    ).lean();
  },

  async getFeeDefaulters() {
    return Student.find(
      { 'feeDetails.pendingFees': { $gt: 0 } },
      'firstName lastName email contact academicDetails.class feeDetails.totalFees feeDetails.paidAmount feeDetails.pendingFees'
    )
      .sort({ 'feeDetails.pendingFees': -1 })
      .lean();
  },
};
