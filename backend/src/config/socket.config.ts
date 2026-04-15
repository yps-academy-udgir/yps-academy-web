/**
 * Socket.io Configuration & Event Handlers
 * Manages real-time communication for classroom chat
 */

import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { messageService } from '../modules/chat/message.service';
import { AuthPayload } from '../middleware/auth.middleware';

/**
 * Socket.io Event Handlers for Classroom Chat
 */
export const initializeSocketHandlers = (io: Server) => {
  io.use((socket: Socket, next: (err?: Error) => void) => {
    // Verify JWT token from query params or auth headers
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const secret = process.env.JWT_SECRET || 'yps-academy-super-secret-jwt-key-change-in-production';
      const decoded = jwt.verify(token, secret) as AuthPayload;
      socket.data.user = decoded;
      next();
    } catch (error: any) {
      logger.error(`Socket authentication failed: ${error.message}`);
      next(new Error('Authentication failed'));
    }
  });

  /**
   * Handle client connection
   */
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user?.userId;
    const userName = socket.data.user?.name;
    const userRole = socket.data.user?.role;

    logger.info(`User connected: ${userId} (${userRole})`);

    /**
     * Join classroom chat
     * Event: classroom:join
     * Data: { classroomId: string }
     */
    socket.on('classroom:join', async (data: { classroomId: string }) => {
      try {
        const { classroomId } = data;
        const roomName = `classroom:${classroomId}`;

        socket.join(roomName);
        logger.info(`User ${userId} joined classroom ${classroomId}`);

        // Notify others in the room that user joined (optional)
        socket.to(roomName).emit('classroom:user-joined', {
          userId,
          userName,
          userRole,
          timestamp: new Date(),
        });
      } catch (error: any) {
        logger.error(`Error joining classroom: ${error.message}`);
        socket.emit('error', { message: 'Failed to join classroom' });
      }
    });

    /**
     * Leave classroom chat
     * Event: classroom:leave
     * Data: { classroomId: string }
     */
    socket.on('classroom:leave', (data: { classroomId: string }) => {
      try {
        const { classroomId } = data;
        const roomName = `classroom:${classroomId}`;

        socket.leave(roomName);
        logger.info(`User ${userId} left classroom ${classroomId}`);

        // Notify others in the room
        io.to(roomName).emit('classroom:user-left', {
          userId,
          userName,
          timestamp: new Date(),
        });
      } catch (error: any) {
        logger.error(`Error leaving classroom: ${error.message}`);
      }
    });

    /**
     * Send a message to classroom
     * Event: message:send
     * Data: { classroomId: string, messageText: string, attachments?: [] }
     */
    socket.on('message:send', async (data: any) => {
      try {
        const { classroomId, messageText, attachments = [] } = data;

        // Validate
        if (!classroomId || !messageText) {
          socket.emit('error', { message: 'classroomId and messageText are required' });
          return;
        }

        // Save message to database via service
        const message = await messageService.sendMessage(
          {
            classroomId,
            messageText,
            attachments,
          },
          userId!,
          userName!,
          userRole as 'admin' | 'student' | 'faculty'
        );

        const roomName = `classroom:${classroomId}`;

        // Broadcast message to all clients in the classroom
        io.to(roomName).emit('message:new', {
          ...message,
          socketId: socket.id, // For client-side deduplication
        });

        logger.info(`Message sent in classroom ${classroomId} by ${userId}`);
      } catch (error: any) {
        logger.error(`Error sending message: ${error.message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Mark message as read
     * Event: message:mark-read
     * Data: { classroomId: string, messageId: string }
     */
    socket.on('message:mark-read', async (data: { classroomId: string; messageId: string }) => {
      try {
        const { classroomId, messageId } = data;

        const message = await messageService.markMessageAsRead(messageId, userId!, classroomId);

        const roomName = `classroom:${classroomId}`;

        // Broadcast read receipt to all clients in the classroom
        io.to(roomName).emit('message:read', {
          messageId,
          userId,
          userName,
          readAt: new Date(),
        });

        logger.info(`Message ${messageId} marked as read by ${userId}`);
      } catch (error: any) {
        logger.error(`Error marking message as read: ${error.message}`);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error: any) => {
      logger.error(`Socket error for user ${userId}: ${error.message}`);
    });
  });
};
