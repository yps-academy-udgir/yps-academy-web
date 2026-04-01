import { classroomRepository, ClassroomFilter, PaginationOptions } from './classroom.repository';
import type {
  CreateClassroomDto, UpdateClassroomDto,
  AssignFacultyDto, EnrollStudentDto, UpdateScheduleDto,
} from './dto/classroom.dto';

function serviceError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode });
}

export const classroomService = {
  async getAll(filter: ClassroomFilter, pagination: PaginationOptions) {
    return classroomRepository.findAll(filter, pagination);
  },

  async getById(id: string) {
    return classroomRepository.findById(id);
  },

  async create(dto: CreateClassroomDto) {
    const duplicate = await classroomRepository.findDuplicate(
      dto.class, dto.section, dto.academicYear
    );
    if (duplicate) {
      throw serviceError(
        `Classroom ${dto.class} ${dto.section} already exists for academic year ${dto.academicYear}`,
        409
      );
    }

    return classroomRepository.create({
      class: dto.class,
      section: dto.section.toUpperCase(),
      roomNumber: dto.roomNumber,
      capacity: dto.capacity,
      academicYear: dto.academicYear,
      facultyAssignments: [],
      enrolledStudents: [],
      weeklySchedule: [],
    });
  },

  async update(id: string, dto: UpdateClassroomDto) {
    const classroom = await classroomRepository.findByIdDoc(id);
    if (!classroom) throw serviceError('Classroom not found', 404);

    if (dto.capacity !== undefined && dto.capacity < classroom.enrolledStudents.length) {
      throw serviceError(
        `Cannot reduce capacity to ${dto.capacity}. Currently ${classroom.enrolledStudents.length} students enrolled.`,
        400
      );
    }

    if (dto.class || dto.section || dto.academicYear) {
      const newClass = dto.class || classroom.class;
      const newSection = dto.section ? dto.section.toUpperCase() : classroom.section;
      const newYear = dto.academicYear || classroom.academicYear;
      const duplicate = await classroomRepository.findDuplicate(newClass, newSection, newYear, id);
      if (duplicate) {
        throw serviceError(
          `Classroom ${newClass} ${newSection} already exists for academic year ${newYear}`,
          409
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.class !== undefined) updateData.class = dto.class;
    if (dto.section !== undefined) updateData.section = dto.section.toUpperCase();
    if (dto.roomNumber !== undefined) updateData.roomNumber = dto.roomNumber;
    if (dto.capacity !== undefined) updateData.capacity = dto.capacity;
    if (dto.academicYear !== undefined) updateData.academicYear = dto.academicYear;

    return classroomRepository.update(id, updateData);
  },

  async delete(id: string) {
    const classroom = await classroomRepository.findByIdDoc(id);
    if (!classroom) throw serviceError('Classroom not found', 404);

    if (classroom.enrolledStudents.length > 0) {
      throw serviceError(
        `Cannot delete classroom with ${classroom.enrolledStudents.length} enrolled students. Remove students first.`,
        400
      );
    }

    return classroomRepository.delete(id);
  },

  async assignFaculty(id: string, dto: AssignFacultyDto) {
    const classroom = await classroomRepository.findByIdDoc(id);
    if (!classroom) throw serviceError('Classroom not found', 404);

    const duplicate = classroom.facultyAssignments.find(
      fa => fa.facultyId.toString() === dto.facultyId && fa.subject === dto.subject
    );
    if (duplicate) {
      throw serviceError(`Faculty already assigned to teach ${dto.subject} in this classroom`, 409);
    }

    classroom.facultyAssignments.push({
      facultyId: dto.facultyId as any,
      subject: dto.subject as any,
      isPrimary: dto.isPrimary ?? false,
    });

    await classroom.save();
    return classroomRepository.findById(id);
  },

  async removeFaculty(id: string, facultyId: string, subject?: string) {
    const classroom = await classroomRepository.findByIdDoc(id);
    if (!classroom) throw serviceError('Classroom not found', 404);

    if (subject) {
      classroom.facultyAssignments = classroom.facultyAssignments.filter(
        fa => !(fa.facultyId.toString() === facultyId && fa.subject === subject)
      );
    } else {
      classroom.facultyAssignments = classroom.facultyAssignments.filter(
        fa => fa.facultyId.toString() !== facultyId
      );
    }

    classroom.weeklySchedule = classroom.weeklySchedule.filter(
      slot => slot.facultyId.toString() !== facultyId || (!!subject && slot.subject !== subject)
    );

    return classroom.save();
  },

  async enrollStudent(id: string, dto: EnrollStudentDto) {
    const classroom = await classroomRepository.findByIdDoc(id);
    if (!classroom) throw serviceError('Classroom not found', 404);

    if (classroom.enrolledStudents.length >= classroom.capacity) {
      throw serviceError(`Classroom is at full capacity (${classroom.capacity} students)`, 400);
    }

    if (classroom.enrolledStudents.some(sid => sid.toString() === dto.studentId)) {
      throw serviceError('Student is already enrolled in this classroom', 409);
    }

    classroom.enrolledStudents.push(dto.studentId as any);
    await classroom.save();
    return classroomRepository.findById(id);
  },

  async removeStudent(id: string, studentId: string) {
    const classroom = await classroomRepository.findByIdDoc(id);
    if (!classroom) throw serviceError('Classroom not found', 404);

    classroom.enrolledStudents = classroom.enrolledStudents.filter(
      sid => sid.toString() !== studentId
    );

    return classroom.save();
  },

  async getSchedule(id: string) {
    const classroom = await classroomRepository.findByIdWithSchedule(id);
    if (!classroom) throw serviceError('Classroom not found', 404);
    return {
      classroomId: classroom._id,
      class: classroom.class,
      section: classroom.section,
      schedule: classroom.weeklySchedule,
    };
  },

  async updateSchedule(id: string, dto: UpdateScheduleDto) {
    const classroom = await classroomRepository.findByIdDoc(id);
    if (!classroom) throw serviceError('Classroom not found', 404);

    const assignedFacultyIds = classroom.facultyAssignments.map(fa => fa.facultyId.toString());
    for (const slot of dto.schedule) {
      if (!assignedFacultyIds.includes(slot.facultyId)) {
        throw serviceError(`Faculty ${slot.facultyId} is not assigned to this classroom`, 400);
      }
    }

    classroom.weeklySchedule = dto.schedule as any;
    await classroom.save();

    return classroomRepository.findByIdWithSchedule(id);
  },

  async getStats() {
    return classroomRepository.getStats();
  },
};
