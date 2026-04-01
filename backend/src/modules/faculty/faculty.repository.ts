import { FilterQuery } from 'mongoose';
import { Faculty, IFaculty } from '../../models/faculty.model';

export interface FacultyFilter {
  department?: string;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export const facultyRepository = {
  async findAll(filter: FacultyFilter, { page, limit }: PaginationOptions) {
    const query: FilterQuery<IFaculty> = {};

    if (filter.department) query.department = filter.department as any;

    if (filter.search) {
      query.$or = [
        { firstName: { $regex: filter.search, $options: 'i' } },
        { lastName: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
        { contact: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [faculty, total] = await Promise.all([
      Faculty.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Faculty.countDocuments(query),
    ]);

    return { faculty, total };
  },

  async findById(id: string) {
    return Faculty.findById(id).lean();
  },

  async findByIdDoc(id: string) {
    return Faculty.findById(id);
  },

  async findByEmail(email: string, excludeId?: string) {
    const query: FilterQuery<IFaculty> = { email: email.toLowerCase().trim() };
    if (excludeId) query._id = { $ne: excludeId };
    return Faculty.findOne(query).lean();
  },

  async create(data: Record<string, unknown>) {
    return Faculty.create(data);
  },

  async update(id: string, data: Record<string, unknown>) {
    return Faculty.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  },

  async delete(id: string) {
    return Faculty.findByIdAndDelete(id);
  },

  async getStats() {
    const [total, byDepartment] = await Promise.all([
      Faculty.countDocuments(),
      Faculty.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      total,
      byDepartment: byDepartment.reduce((acc: Record<string, number>, d) => {
        acc[d._id] = d.count;
        return acc;
      }, {}),
    };
  },
};
