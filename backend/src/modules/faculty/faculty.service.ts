import { facultyRepository, FacultyFilter, PaginationOptions } from './faculty.repository';
import { createAuthUser, deleteAuthUser } from '../../utils/auth-user.util';
import { generateFacultyRollNumber } from '../../utils/generate-roll-number.util';
import { generateUserId } from '../../utils/generate-user-id.util';
import type { CreateFacultyDto, UpdateFacultyDto, AddSalaryPaymentDto } from './dto/faculty.dto';

function serviceError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export const facultyService = {
  async getAll(filter: FacultyFilter, pagination: PaginationOptions) {
    return facultyRepository.findAll(filter, pagination);
  },

  async getById(id: string) {
    return facultyRepository.findById(id);
  },

  async getMe(userId: string) {
    const faculty = await facultyRepository.findByUserId(userId);
    if (!faculty) throw Object.assign(new Error('Faculty profile not found'), { statusCode: 404 });
    return faculty;
  },

  async create(dto: CreateFacultyDto, imageFile?: Express.Multer.File) {
    const existing = await facultyRepository.findByEmail(dto.email);
    if (existing) throw serviceError('A faculty member with this email already exists', 400);

    const imagePath = imageFile ? `/uploads/${imageFile.filename}` : undefined;
    const rollNumber = await generateFacultyRollNumber();

    const userId = await generateUserId('faculty', dto.firstName, rollNumber);

    const faculty = await facultyRepository.create({
      ...dto,
      userId,
      rollNumber,
      ...(imagePath && { image: imagePath }),
    });

    const { defaultPassword } = await createAuthUser(userId, `${dto.firstName} ${dto.lastName}`, 'faculty');

    return { faculty, userId, defaultPassword };
  },

  async update(id: string, dto: UpdateFacultyDto, imageFile?: Express.Multer.File) {
    const existing = await facultyRepository.findByIdDoc(id);
    if (!existing) throw serviceError('Faculty member not found', 404);

    if (dto.email && dto.email.toLowerCase().trim() !== existing.email) {
      const emailInUse = await facultyRepository.findByEmail(dto.email, id);
      if (emailInUse) throw serviceError('Email already in use by another faculty member', 400);
    }

    const imagePath = imageFile ? `/uploads/${imageFile.filename}` : existing.image;

    return facultyRepository.update(id, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.contact !== undefined && { contact: dto.contact }),
      ...(dto.department !== undefined && { department: dto.department }),
      ...(dto.speciality !== undefined && { speciality: dto.speciality }),
      ...(dto.degree !== undefined && { degree: dto.degree }),
      ...(dto.yearsOfExperience !== undefined && { yearsOfExperience: dto.yearsOfExperience }),
      ...(dto.pastExperience !== undefined && { pastExperience: dto.pastExperience }),
      ...(dto.annualSalary !== undefined && { annualSalary: dto.annualSalary }),
      ...(dto.salaryPayments !== undefined && { salaryPayments: dto.salaryPayments }),
      ...(imagePath && { image: imagePath }),
    });
  },

  async delete(id: string) {
    const deleted = await facultyRepository.delete(id);
    if (!deleted) throw serviceError('Faculty member not found', 404);
    if (deleted.userId) await deleteAuthUser(deleted.userId, 'faculty');
    return deleted;
  },

  async addSalaryPayment(id: string, dto: AddSalaryPaymentDto) {
    const faculty = await facultyRepository.findByIdDoc(id);
    if (!faculty) throw serviceError('Faculty member not found', 404);

    faculty.salaryPayments.push({ date: new Date(dto.date), amount: dto.amount, note: dto.note });
    return faculty.save();
  },

  async getStats() {
    return facultyRepository.getStats();
  },
};
