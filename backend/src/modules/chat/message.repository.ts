/**
 * Message Repository
 * Handles all database operations for messages
 */

import { FilterQuery } from 'mongoose';
import Message, { IMessage } from '../../models/message.model';
import Classroom, { IClassroom } from '../../models/classroom.model';
import { Student } from '../../models/student.model';
import { Faculty } from '../../models/faculty.model';

export interface MessageFilter {
  classroomId: string;
  page?: number;
  limit?: number;
}

export const messageRepository = {
  /**
   * Find all messages for a classroom (paginated)
   */
  async findByClassroom(classroomId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ classroomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ classroomId }),
    ]);

    return {
      messages: messages.reverse(), // Return in chronological order (oldest first)
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Find a single message by ID
   */
  async findById(messageId: string) {
    return Message.findById(messageId).lean();
  },

  /**
   * Create a new message
   */
  async create(data: {
    classroomId: string;
    senderId: string;
    senderRole: 'student' | 'faculty' | 'admin';
    senderName: string;
    senderAvatar?: string;
    messageText: string;
    attachments?: any[];
  }) {
    const message = new Message({
      classroomId: data.classroomId,
      senderId: data.senderId,
      senderRole: data.senderRole,
      senderName: data.senderName,
      senderAvatar: data.senderAvatar || null,
      messageText: data.messageText,
      attachments: data.attachments || [],
      readBy: [], // Initially empty until sender marks as read
    });

    return message.save();
  },

  /**
   * Mark message as read by a user
   * Adds user to readBy array if not already there
   */
  async markAsRead(messageId: string, userId: string) {
    return Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      },
      { new: true }
    ).lean();
  },

  /**
   * Check if user has read a message
   */
  async isReadByUser(messageId: string, userId: string): Promise<boolean> {
    const message = await Message.findById(messageId, { readBy: 1 }).lean();
    if (!message) return false;
    return message.readBy.some((receipt) => receipt.userId === userId);
  },

  /**
   * Get unread count for a user in a specific classroom
   */
  async getUnreadCount(classroomId: string, userId: string): Promise<number> {
    return Message.countDocuments({
      classroomId,
      'readBy.userId': { $ne: userId },
    });
  },

  /**
   * Get unread counts for all classrooms for a user
   * Returns object like { classroomId: unreadCount, ... }
   */
  async getUnreadCountsByClassroom(userId: string): Promise<Record<string, number>> {
    const result = await Message.aggregate([
      {
        $match: {
          'readBy.userId': { $ne: userId },
        },
      },
      {
        $group: {
          _id: '$classroomId',
          unreadCount: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<string, number> = {};
    result.forEach((item) => {
      counts[item._id.toString()] = item.unreadCount;
    });

    return counts;
  },

  /**
   * Get classrooms where a user is enrolled/faculty
   * Used to calculate unread counts for sidebar
   */
  async getUserClassrooms(userId: string, role: 'student' | 'faculty'): Promise<string[]> {
    const query: FilterQuery<IClassroom> = {};
    const entity = role === 'student'
      ? await Student.findOne({ userId }).select('_id').lean()
      : await Faculty.findOne({ userId }).select('_id').lean();

    if (!entity?._id) {
      return [];
    }

    if (role === 'student') {
      query.enrolledStudents = entity._id;
    } else if (role === 'faculty') {
      query['facultyAssignments.facultyId'] = entity._id;
    }

    const classrooms = await Classroom.find(query, { _id: 1 }).lean();
    return classrooms.map((c) => c._id.toString());
  },

  /**
   * Delete a message (optional feature)
   */
  async deleteMessage(messageId: string) {
    return Message.findByIdAndDelete(messageId);
  },

  /**
   * Get latest message in a classroom (for sidebar preview)
   */
  async getLatestMessage(classroomId: string) {
    return Message.findOne({ classroomId }).sort({ createdAt: -1 }).lean();
  },

  /**
   * Get unread messages for a user in multiple classrooms
   */
  async getUnreadMessages(classroomIds: string[], userId: string) {
    return Message.find({
      classroomId: { $in: classroomIds },
      'readBy.userId': { $ne: userId },
    })
      .select('classroomId senderId senderName messageText createdAt')
      .sort({ createdAt: -1 })
      .lean();
  },
};
