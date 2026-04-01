import { studentRepository, StudentFilter, PaginationOptions } from './student.repository';
import { calculateFeeDetails } from '../../utils/fee-calculator.util';
import type { CreateStudentDto, UpdateStudentDto, AddPaymentDto } from './dto/student.dto';
import type { IAcademicDetails, IFeeDetails } from '../../models/student.model';

function serviceError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export const studentService = {
  async getAll(filter: StudentFilter, pagination: PaginationOptions) {
    return studentRepository.findAll(filter, pagination);
  },

  async getById(id: string) {
    return studentRepository.findById(id);
  },

  async create(dto: CreateStudentDto, imageFile?: Express.Multer.File) {
    const existing = await studentRepository.findByEmail(dto.email);
    if (existing) throw serviceError('Student with this email already exists', 400);

    const feeDetails = calculateFeeDetails(
      dto.academicDetails as IAcademicDetails | undefined,
      dto.feeDetails as Partial<IFeeDetails> | undefined
    );

    const imagePath = imageFile ? `/uploads/${imageFile.filename}` : undefined;

    return studentRepository.create({
      ...dto,
      feeDetails,
      ...(imagePath && { image: imagePath }),
    });
  },

  async update(id: string, dto: UpdateStudentDto, imageFile?: Express.Multer.File) {
    const existing = await studentRepository.findByIdDoc(id);
    if (!existing) throw serviceError('Student not found', 404);

    if (dto.email && dto.email !== existing.email) {
      const emailInUse = await studentRepository.findByEmail(dto.email, id);
      if (emailInUse) throw serviceError('Email already in use by another student', 400);
    }

    const updatedAcademicDetails = (dto.academicDetails ?? existing.academicDetails) as IAcademicDetails | undefined;
    const feeDetails = calculateFeeDetails(
      updatedAcademicDetails,
      (dto.feeDetails ?? existing.feeDetails) as Partial<IFeeDetails> | undefined
    );

    const imagePath = imageFile ? `/uploads/${imageFile.filename}` : existing.image;

    return studentRepository.update(id, {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.contact !== undefined && { contact: dto.contact }),
      ...(dto.gender !== undefined && { gender: dto.gender }),
      ...(dto.academicDetails !== undefined && { academicDetails: dto.academicDetails }),
      feeDetails,
      ...(imagePath && { image: imagePath }),
    });
  },

  async delete(id: string) {
    const deleted = await studentRepository.delete(id);
    if (!deleted) throw serviceError('Student not found', 404);
    return deleted;
  },

  async addPayment(id: string, dto: AddPaymentDto) {
    const student = await studentRepository.findByIdDoc(id);
    if (!student) throw serviceError('Student not found', 404);
    if (!student.feeDetails) throw serviceError('Student has no fee details configured', 400);

    student.feeDetails.paymentHistory.push({
      amount: dto.amount,
      paymentDate: new Date(),
      ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
      ...(dto.remarks && { remarks: dto.remarks }),
    });
    student.feeDetails.paidAmount = (student.feeDetails.paidAmount || 0) + dto.amount;
    student.feeDetails.pendingFees = Math.max(
      0,
      (student.feeDetails.totalFees || 0) - student.feeDetails.paidAmount
    );

    return student.save();
  },

  async getStats() {
    return studentRepository.getStats();
  },

  async getFeesSummary() {
    const students = await studentRepository.getFeesSummary();

    type ClassSummary = { totalFees: number; collected: number; pending: number; studentCount: number };
    const byClass: Record<string, ClassSummary> = {};
    const totals: ClassSummary = { totalFees: 0, collected: 0, pending: 0, studentCount: 0 };

    for (const student of students) {
      const cls = (student as any).academicDetails?.class ?? 'Unassigned';
      if (!byClass[cls]) byClass[cls] = { totalFees: 0, collected: 0, pending: 0, studentCount: 0 };
      const fees = (student as any).feeDetails;
      byClass[cls].studentCount++;
      byClass[cls].totalFees += fees?.totalFees ?? 0;
      byClass[cls].collected += fees?.paidAmount ?? 0;
      byClass[cls].pending += fees?.pendingFees ?? 0;
      totals.studentCount++;
      totals.totalFees += fees?.totalFees ?? 0;
      totals.collected += fees?.paidAmount ?? 0;
      totals.pending += fees?.pendingFees ?? 0;
    }

    return { byClass, totals };
  },

  async getFeeDefaulters() {
    return studentRepository.getFeeDefaulters();
  },
};
