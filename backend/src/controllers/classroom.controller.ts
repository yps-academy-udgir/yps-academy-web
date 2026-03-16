/**
 * Classroom Controller
 * Handles classroom CRUD operations, faculty assignments, student enrollment, and schedule management
 */

import { Request, Response } from 'express';
import Classroom from '../models/classroom.model';
import { successResponse, errorResponse } from '../utils/response.util';

/**
 * Get all classrooms with pagination and filters
 * GET /api/classrooms?page=1&limit=10&class=5th&section=A&academicYear=2025-2026&search=101
 */
export const getAllClassrooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: any = {};

    if (req.query.class) {
      filter.class = req.query.class;
    }

    if (req.query.section) {
      filter.section = (req.query.section as string).toUpperCase();
    }

    if (req.query.academicYear) {
      filter.academicYear = req.query.academicYear;
    }

    // Search by room number
    if (req.query.search) {
      filter.roomNumber = { $regex: req.query.search, $options: 'i' };
    }

    // Execute queries in parallel
    const [classrooms, total] = await Promise.all([
      Classroom.find(filter)
        .populate('facultyAssignments.facultyId', 'firstName lastName email speciality')
        .populate('enrolledStudents', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Classroom.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: 'Classrooms retrieved successfully',
      data: classrooms,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching classrooms:', error);
    errorResponse(res, 'Failed to fetch classrooms', 500);
  }
};

/**
 * Get single classroom by ID
 * GET /api/classrooms/:id
 */
export const getClassroomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('facultyAssignments.facultyId', 'firstName lastName email contact department speciality')
      .populate('enrolledStudents', 'firstName lastName email contact academicDetails')
      .lean();

    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    successResponse(res, classroom, 'Classroom retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching classroom:', error);
    errorResponse(res, 'Failed to fetch classroom', 500);
  }
};

/**
 * Create new classroom
 * POST /api/classrooms
 */
export const createClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: classValue, section, roomNumber, capacity, academicYear } = req.body;

    // Check for duplicate classroom (class + section + academicYear)
    const existingClassroom = await Classroom.findOne({
      class: classValue,
      section: section.toUpperCase(),
      academicYear,
    });

    if (existingClassroom) {
      errorResponse(res, `Classroom ${classValue} ${section} already exists for academic year ${academicYear}`, 409);
      return;
    }

    // Create classroom with empty arrays for assignments and students
    const classroom = new Classroom({
      class: classValue,
      section: section.toUpperCase(),
      roomNumber,
      capacity,
      academicYear,
      facultyAssignments: [],
      enrolledStudents: [],
      weeklySchedule: [],
    });

    await classroom.save();

    successResponse(res, classroom, 'Classroom created successfully', 201);
  } catch (error: any) {
    console.error('Error creating classroom:', error);
    if (error.code === 11000) {
      errorResponse(res, 'Classroom with this class, section, and academic year already exists', 409);
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      errorResponse(res, 'Validation failed', 400, errors);
    } else {
      errorResponse(res, 'Failed to create classroom', 500);
    }
  }
};

/**
 * Update classroom
 * PUT /api/classrooms/:id
 */
export const updateClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: classValue, section, roomNumber, capacity, academicYear } = req.body;

    // Find classroom first
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    // Check capacity constraint if updating capacity
    if (capacity !== undefined && capacity < classroom.enrolledStudents.length) {
      errorResponse(
        res,
        `Cannot reduce capacity to ${capacity}. Currently ${classroom.enrolledStudents.length} students enrolled.`,
        400
      );
      return;
    }

    // Check for duplicate if class/section/year is changing
    if (classValue || section || academicYear) {
      const newClass = classValue || classroom.class;
      const newSection = section ? section.toUpperCase() : classroom.section;
      const newYear = academicYear || classroom.academicYear;

      const existingClassroom = await Classroom.findOne({
        _id: { $ne: req.params.id },
        class: newClass,
        section: newSection,
        academicYear: newYear,
      });

      if (existingClassroom) {
        errorResponse(res, `Classroom ${newClass} ${newSection} already exists for academic year ${newYear}`, 409);
        return;
      }
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (classValue !== undefined) updateData.class = classValue;
    if (section !== undefined) updateData.section = section.toUpperCase();
    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (academicYear !== undefined) updateData.academicYear = academicYear;

    const updatedClassroom = await Classroom.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('facultyAssignments.facultyId', 'firstName lastName email speciality')
      .populate('enrolledStudents', 'firstName lastName email');

    successResponse(res, updatedClassroom, 'Classroom updated successfully');
  } catch (error: any) {
    console.error('Error updating classroom:', error);
    if (error.code === 11000) {
      errorResponse(res, 'Classroom with this class, section, and academic year already exists', 409);
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      errorResponse(res, 'Validation failed', 400, errors);
    } else {
      errorResponse(res, 'Failed to update classroom', 500);
    }
  }
};

/**
 * Delete classroom
 * DELETE /api/classrooms/:id
 */
export const deleteClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    // Warn if students are enrolled
    if (classroom.enrolledStudents.length > 0) {
      errorResponse(
        res,
        `Cannot delete classroom with ${classroom.enrolledStudents.length} enrolled students. Remove students first.`,
        400
      );
      return;
    }

    await Classroom.findByIdAndDelete(req.params.id);

    successResponse(res, null, 'Classroom deleted successfully');
  } catch (error: any) {
    console.error('Error deleting classroom:', error);
    errorResponse(res, 'Failed to delete classroom', 500);
  }
};

/**
 * Assign faculty to classroom
 * POST /api/classrooms/:id/faculty
 * Body: { facultyId, subject, isPrimary }
 */
export const assignFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyId, subject, isPrimary } = req.body;

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    // Check for duplicate assignment (same faculty + subject)
    const existingAssignment = classroom.facultyAssignments.find(
      (fa) => fa.facultyId.toString() === facultyId && fa.subject === subject
    );

    if (existingAssignment) {
      errorResponse(res, `Faculty already assigned to teach ${subject} in this classroom`, 409);
      return;
    }

    // Add faculty assignment
    classroom.facultyAssignments.push({
      facultyId,
      subject,
      isPrimary: isPrimary || false,
    });

    await classroom.save();

    const updatedClassroom = await Classroom.findById(req.params.id)
      .populate('facultyAssignments.facultyId', 'firstName lastName email speciality')
      .lean();

    successResponse(res, updatedClassroom, 'Faculty assigned successfully');
  } catch (error: any) {
    console.error('Error assigning faculty:', error);
    errorResponse(res, 'Failed to assign faculty', 500);
  }
};

/**
 * Remove faculty from classroom
 * DELETE /api/classrooms/:id/faculty/:facultyId
 * Query: ?subject=Mathematics (to remove specific subject assignment)
 */
export const removeFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { facultyId } = req.params;
    const { subject } = req.query;

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    // Remove faculty assignment
    if (subject) {
      // Remove specific subject assignment
      classroom.facultyAssignments = classroom.facultyAssignments.filter(
        (fa) => !(fa.facultyId.toString() === facultyId && fa.subject === subject)
      );
    } else {
      // Remove all assignments for this faculty
      classroom.facultyAssignments = classroom.facultyAssignments.filter(
        (fa) => fa.facultyId.toString() !== facultyId
      );
    }

    // Also remove from schedule
    classroom.weeklySchedule = classroom.weeklySchedule.filter(
      (slot) => slot.facultyId.toString() !== facultyId || (subject && slot.subject !== subject)
    );

    await classroom.save();

    successResponse(res, classroom, 'Faculty removed successfully');
  } catch (error: any) {
    console.error('Error removing faculty:', error);
    errorResponse(res, 'Failed to remove faculty', 500);
  }
};

/**
 * Enroll student in classroom
 * POST /api/classrooms/:id/students
 * Body: { studentId }
 */
export const enrollStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.body;

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    // Check capacity
    if (classroom.enrolledStudents.length >= classroom.capacity) {
      errorResponse(res, `Classroom is at full capacity (${classroom.capacity} students)`, 400);
      return;
    }

    // Check if already enrolled
    if (classroom.enrolledStudents.some((sid) => sid.toString() === studentId)) {
      errorResponse(res, 'Student is already enrolled in this classroom', 409);
      return;
    }

    classroom.enrolledStudents.push(studentId);
    await classroom.save();

    const updatedClassroom = await Classroom.findById(req.params.id)
      .populate('enrolledStudents', 'firstName lastName email')
      .lean();

    successResponse(res, updatedClassroom, 'Student enrolled successfully');
  } catch (error: any) {
    console.error('Error enrolling student:', error);
    errorResponse(res, 'Failed to enroll student', 500);
  }
};

/**
 * Remove student from classroom
 * DELETE /api/classrooms/:id/students/:studentId
 */
export const removeStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    classroom.enrolledStudents = classroom.enrolledStudents.filter((sid) => sid.toString() !== studentId);
    await classroom.save();

    successResponse(res, classroom, 'Student removed successfully');
  } catch (error: any) {
    console.error('Error removing student:', error);
    errorResponse(res, 'Failed to remove student', 500);
  }
};

/**
 * Update classroom schedule
 * PUT /api/classrooms/:id/schedule
 * Body: { schedule: IScheduleSlot[] }
 */
export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { schedule } = req.body;

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    // Validate that all faculty in schedule are assigned to classroom
    const assignedFacultyIds = classroom.facultyAssignments.map((fa) => fa.facultyId.toString());

    for (const slot of schedule) {
      if (!assignedFacultyIds.includes(slot.facultyId.toString())) {
        errorResponse(res, `Faculty ${slot.facultyId} is not assigned to this classroom`, 400);
        return;
      }
    }

    classroom.weeklySchedule = schedule;
    await classroom.save();

    const updatedClassroom = await Classroom.findById(req.params.id)
      .populate('weeklySchedule.facultyId', 'firstName lastName')
      .lean();

    successResponse(res, updatedClassroom, 'Schedule updated successfully');
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    errorResponse(res, 'Failed to update schedule', 500);
  }
};

/**
 * Get classroom schedule
 * GET /api/classrooms/:id/schedule
 */
export const getSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .select('weeklySchedule class section')
      .populate('weeklySchedule.facultyId', 'firstName lastName email speciality')
      .lean();

    if (!classroom) {
      errorResponse(res, 'Classroom not found', 404);
      return;
    }

    successResponse(res, {
      classroomId: classroom._id,
      class: classroom.class,
      section: classroom.section,
      schedule: classroom.weeklySchedule,
    }, 'Schedule retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    errorResponse(res, 'Failed to fetch schedule', 500);
  }
};

/**
 * Get classroom statistics
 * GET /api/classrooms/stats/overview
 */
export const getClassroomStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalClassrooms, classroomsByClass, totalCapacity, totalEnrolled] = await Promise.all([
      Classroom.countDocuments(),
      Classroom.aggregate([
        {
          $group: {
            _id: '$class',
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
      Classroom.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$capacity' },
          },
        },
      ]),
      Classroom.aggregate([
        {
          $project: {
            enrolledCount: { $size: '$enrolledStudents' },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$enrolledCount' },
          },
        },
      ]),
    ]);

    const stats = {
      totalClassrooms,
      byClass: classroomsByClass,
      totalCapacity: totalCapacity[0]?.total || 0,
      totalEnrolled: totalEnrolled[0]?.total || 0,
      occupancyRate:
        totalCapacity[0]?.total > 0
          ? ((totalEnrolled[0]?.total || 0) / totalCapacity[0].total) * 100
          : 0,
    };

    successResponse(res, stats, 'Classroom statistics retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching classroom stats:', error);
    errorResponse(res, 'Failed to fetch classroom statistics', 500);
  }
};
