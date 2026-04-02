import { Request, Response } from 'express';
import { classroomService } from './classroom.service';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.util';
import {
  createClassroomSchema, updateClassroomSchema,
  assignFacultySchema, enrollStudentSchema, updateScheduleSchema,
} from './dto/classroom.dto';

function handleError(res: Response, error: any, fallback: string): void {
  if (error.statusCode) { errorResponse(res, error.message, error.statusCode); return; }
  if (error.code === 11000) { errorResponse(res, 'Duplicate entry', 409); return; }
  if (error.name === 'ValidationError') {
    errorResponse(res, 'Validation failed', 400, Object.values(error.errors).map((e: any) => e.message));
    return;
  }
  errorResponse(res, fallback, 500);
}

export const getMyClassrooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const classrooms = await classroomService.getMyClassrooms(userId, role as 'student' | 'faculty');
    successResponse(res, classrooms, 'Classrooms retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to fetch classrooms');
  }
};

export const getAllClassrooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const { classrooms, total } = await classroomService.getAll(
      {
        class: req.query['class'] as string,
        section: req.query['section'] as string,
        academicYear: req.query['academicYear'] as string,
        search: req.query['search'] as string,
      },
      { page, limit }
    );
    paginatedResponse(res, classrooms, { total, page, limit, pages: Math.ceil(total / limit) }, 'Classrooms retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to fetch classrooms');
  }
};

export const getClassroomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const classroom = await classroomService.getById(req.params['id']);
    if (!classroom) { errorResponse(res, 'Classroom not found', 404); return; }
    successResponse(res, classroom, 'Classroom retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to fetch classroom');
  }
};

export const createClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createClassroomSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message));
      return;
    }
    const classroom = await classroomService.create(parsed.data);
    successResponse(res, classroom, 'Classroom created successfully', 201);
  } catch (error: any) {
    handleError(res, error, 'Failed to create classroom');
  }
};

export const updateClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateClassroomSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message));
      return;
    }
    const updated = await classroomService.update(req.params['id'], parsed.data);
    successResponse(res, updated, 'Classroom updated successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to update classroom');
  }
};

export const deleteClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    await classroomService.delete(req.params['id']);
    successResponse(res, null, 'Classroom deleted successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to delete classroom');
  }
};

export const assignFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = assignFacultySchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message));
      return;
    }
    const classroom = await classroomService.assignFaculty(req.params['id'], parsed.data);
    successResponse(res, classroom, 'Faculty assigned successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to assign faculty');
  }
};

export const removeFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const classroom = await classroomService.removeFaculty(
      req.params['id'],
      req.params['facultyId'],
      req.query['subject'] as string | undefined
    );
    successResponse(res, classroom, 'Faculty removed successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to remove faculty');
  }
};

export const enrollStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = enrollStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message));
      return;
    }
    const classroom = await classroomService.enrollStudent(req.params['id'], parsed.data);
    successResponse(res, classroom, 'Student enrolled successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to enroll student');
  }
};

export const removeStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const classroom = await classroomService.removeStudent(req.params['id'], req.params['studentId']);
    successResponse(res, classroom, 'Student removed successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to remove student');
  }
};

export const getSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await classroomService.getSchedule(req.params['id']);
    successResponse(res, data, 'Schedule retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to fetch schedule');
  }
};

export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 'Validation failed', 400, parsed.error.issues.map(i => i.message));
      return;
    }
    const classroom = await classroomService.updateSchedule(req.params['id'], parsed.data);
    successResponse(res, classroom, 'Schedule updated successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to update schedule');
  }
};

export const getClassroomStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await classroomService.getStats();
    successResponse(res, stats, 'Classroom statistics retrieved successfully');
  } catch (error: any) {
    handleError(res, error, 'Failed to fetch classroom statistics');
  }
};
