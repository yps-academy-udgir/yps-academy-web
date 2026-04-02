/**
 * Message Service
 * Business logic for messaging, validation, and Socket.io integration
 */

import { messageRepository } from './message.repository';
import { classroomRepository } from '../classroom/classroom.repository';
import { CreateMessageDto, MessageResponseDto, UnreadCountsDto } from './dto/message.dto';
import logger from '../../utils/logger';
import { Student } from '../../models/student.model';
import { Faculty } from '../../models/faculty.model';
import { isValidObjectId } from 'mongoose';
import { AuthUser } from '../../models/auth.model';

export const messageService = {
  /**
   * Send a message
   * Validates that user is member of classroom
   */
  async sendMessage(
    dto: CreateMessageDto,
    userId: string,
    userName: string,
    userRole: 'admin' | 'student' | 'faculty',
    userAvatar?: string
  ): Promise<MessageResponseDto> {
    try {
      // Validate classroom exists
      const classroom = await classroomRepository.findById(dto.classroomId);
      if (!classroom) {
        throw { message: 'Classroom not found', statusCode: 404 };
      }

      if (userRole !== 'admin') {
        // Validate user is member of classroom
        const isMember = await validateClassroomMembership(classroom, userId, userRole);
        if (!isMember) {
          throw {
            message: 'You are not a member of this classroom',
            statusCode: 403,
          };
        }
      }

      // Create message
      const message = await messageRepository.create({
        classroomId: dto.classroomId,
        senderId: userId,
        senderRole: userRole,
        senderName: userName,
        senderAvatar: userAvatar,
        messageText: dto.messageText,
        attachments: dto.attachments || [],
      });

      // Mark as read by sender
      await messageRepository.markAsRead(message._id.toString(), userId);

      // Fetch and return the message with read receipts
      const savedMessage = await messageRepository.findById(message._id.toString());
      return mapToResponseDto(savedMessage);
    } catch (error: any) {
      logger.info(`Error sending message: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get messages for a classroom
   * Marks messages as read by the requesting user
   */
  async getClassroomMessages(
    classroomId: string,
    userId: string,
    userRole: 'admin' | 'student' | 'faculty',
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: MessageResponseDto[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      // Validate classroom exists
      const classroom = await classroomRepository.findById(classroomId);
      if (!classroom) {
        throw { message: 'Classroom not found', statusCode: 404 };
      }

      if (userRole !== 'admin') {
        const isMember = await validateClassroomMembership(classroom, userId, userRole);
        if (!isMember) {
          throw { message: 'You are not a member of this classroom', statusCode: 403 };
        }
      }

      // Get messages
      const result = await messageRepository.findByClassroom(classroomId, page, limit);

      // Mark all messages as read by user (if not already read)
      const messageIds = result.messages.map((m: any) => m._id.toString());
      for (const messageId of messageIds) {
        const isRead = await messageRepository.isReadByUser(messageId, userId);
        if (!isRead) {
          await messageRepository.markAsRead(messageId, userId);
        }
      }

      const messages = result.messages.map((m) => mapToResponseDto(m));

      return {
        messages,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    } catch (error: any) {
      logger.info(`Error fetching classroom messages: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get unread message counts for all classrooms for a user
   */
  async getUnreadCounts(userId: string, userRole: 'admin' | 'student' | 'faculty'): Promise<UnreadCountsDto> {
    try {
      if (userRole === 'admin') {
        return {};
      }

      // Get all classrooms the user is part of
      const classroomIds = await messageRepository.getUserClassrooms(userId, userRole as 'student' | 'faculty');

      if (classroomIds.length === 0) {
        return {};
      }

      // Get unread counts for those classrooms
      const unreadCounts = await messageRepository.getUnreadCountsByClassroom(userId);

      // Only return counts for user's classrooms
      const result: UnreadCountsDto = {};
      classroomIds.forEach((classroomId) => {
        result[classroomId] = unreadCounts[classroomId] || 0;
      });

      return result;
    } catch (error: any) {
      logger.info(`Error fetching unread counts: ${error.message}`);
      throw error;
    }
  },

  /**
   * Mark a message as read
   */
  async markMessageAsRead(
    messageId: string,
    userId: string,
    classroomId: string
  ): Promise<MessageResponseDto> {
    try {
      // Validate message exists
      const message = await messageRepository.findById(messageId);
      if (!message) {
        throw { message: 'Message not found', statusCode: 404 };
      }

      // Validate message belongs to the classroom
      if (message.classroomId.toString() !== classroomId) {
        throw {
          message: 'Message does not belong to this classroom',
          statusCode: 400,
        };
      }

      // Mark as read
      const updatedMessage = await messageRepository.markAsRead(messageId, userId);
      return mapToResponseDto(updatedMessage);
    } catch (error: any) {
      logger.info(`Error marking message as read: ${error.message}`);
      throw error;
    }
  },
};

/**
 * Validate if user is member of classroom
 */
async function validateClassroomMembership(
  classroom: any,
  userId: string,
  userRole: 'student' | 'faculty'
): Promise<boolean> {
  const entityId = await resolveEntityId(userId, userRole);

  if (userRole === 'student') {
    return classroom.enrolledStudents?.some((student: any) => {
      const populated = typeof student === 'object' ? student : null;
      const matchesEntityId = entityId ? normalizeId(student) === entityId : false;
      const matchesRawId = normalizeId(student) === userId;
      const matchesUserId = populated?.userId === userId;
      const matchesRoll = populated?.rollNumber === userId;
      return matchesEntityId || matchesRawId || matchesUserId || matchesRoll;
    });
  } else if (userRole === 'faculty') {
    return classroom.facultyAssignments?.some((assignment: any) => {
      const faculty = assignment.facultyId;
      const populated = typeof faculty === 'object' ? faculty : null;
      const matchesEntityId = entityId ? normalizeId(faculty) === entityId : false;
      const matchesRawId = normalizeId(faculty) === userId;
      const matchesUserId = populated?.userId === userId;
      const matchesRoll = populated?.rollNumber === userId;
      return matchesEntityId || matchesRawId || matchesUserId || matchesRoll;
    });
  }
  return false;
}

async function resolveEntityId(userId: string, userRole: 'student' | 'faculty'): Promise<string | null> {
  const baseQuery = {
    $or: [
      { userId },
      { rollNumber: userId },
    ],
  } as any;

  if (isValidObjectId(userId)) {
    baseQuery.$or.push({ _id: userId });
  }

  if (userRole === 'student') {
    let student = await Student.findOne(baseQuery).select('_id').lean();
    if (!student?._id) {
      const authUser = await AuthUser.findOne({ userId, role: 'student' }).select('name').lean();
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
        student = await Student.findOne(fallbackNameQuery).select('_id').lean();
      }
    }
    return student?._id?.toString() || null;
  }

  let faculty = await Faculty.findOne(baseQuery).select('_id').lean();
  if (!faculty?._id) {
    const authUser = await AuthUser.findOne({ userId, role: 'faculty' }).select('name').lean();
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
      faculty = await Faculty.findOne(fallbackNameQuery).select('_id').lean();
    }
  }
  return faculty?._id?.toString() || null;
}

function normalizeId(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  if (typeof value.toString === 'function') return value.toString();
  return '';
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Map message document to response DTO
 */
function mapToResponseDto(message: any): MessageResponseDto {
    return {
      _id: message._id.toString(),
      classroomId: message.classroomId.toString(),
      senderId: message.senderId,
      senderName: message.senderName,
      senderRole: message.senderRole,
      senderAvatar: message.senderAvatar || undefined,
      messageText: message.messageText,
      attachments: message.attachments || [],
      readBy: message.readBy || [],
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
