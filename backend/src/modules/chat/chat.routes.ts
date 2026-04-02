/**
 * Chat Routes
 * Handles messaging endpoints for classrooms
 * Can be mounted at /api/classrooms and /api/messages
 */

import { Router, Request, Response, NextFunction } from 'express';
import { messageService } from './message.service';
import { CreateMessageDtoSchema } from './dto/message.dto';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';
import logger from '../../utils/logger';

const router = Router();

// Apply auth middleware to all routes
router.use(verifyToken);

/**
 * POST /api/classrooms/:classroomId/messages
 * Send a message to a classroom
 */
router.post(
  '/:classroomId/messages',
  requireRoles('admin', 'student', 'faculty'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classroomId } = req.params;
      const dto = req.body;

      // Validate DTO
      const validation = CreateMessageDtoSchema.safeParse(dto);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.error.issues,
        });
      }

      // Ensure classroomId in URL matches DTO
      if (classroomId !== validation.data.classroomId) {
        return res.status(400).json({
          success: false,
          message: 'Classroom ID mismatch',
        });
      }

      const message = await messageService.sendMessage(
        validation.data,
        req.user!.userId,
        req.user!.name,
        req.user!.role as 'admin' | 'student' | 'faculty'
      );

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });

      logger.info(`Message sent in classroom ${classroomId} by ${req.user!.userId}`);
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * GET /api/classrooms/:classroomId/messages
 * Get all messages for a classroom
 * Query params: page, limit
 */
router.get(
  '/:classroomId/messages',
  requireRoles('admin', 'student', 'faculty'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classroomId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await messageService.getClassroomMessages(
        classroomId,
        req.user!.userId,
        req.user!.role as 'admin' | 'student' | 'faculty',
        page,
        limit
      );

      res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: result.messages,
        pagination: result.pagination,
      });

      logger.info(`Messages retrieved for classroom ${classroomId}`);
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * PUT /api/classrooms/:classroomId/messages/:messageId/read
 * Mark a message as read
 */
router.put(
  '/:classroomId/messages/:messageId/read',
  requireRoles('admin', 'student', 'faculty'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { classroomId, messageId } = req.params;

      const message = await messageService.markMessageAsRead(messageId, req.user!.userId, classroomId);

      res.status(200).json({
        success: true,
        message: 'Message marked as read',
        data: message,
      });
    } catch (error: any) {
      next(error);
    }
  }
);

/**
 * GET /api/messages/unread-counts
 * Get unread message counts for all classrooms
 * Returns { classroomId: unreadCount, ... }
 */
router.get('/unread-counts', requireRoles('admin', 'student', 'faculty'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const unreadCounts = await messageService.getUnreadCounts(
      req.user!.userId,
      req.user!.role as 'admin' | 'student' | 'faculty'
    );

    res.status(200).json({
      success: true,
      message: 'Unread counts retrieved successfully',
      data: unreadCounts,
    });

    logger.info(`Unread counts retrieved for user ${req.user!.userId}`);
  } catch (error: any) {
    next(error);
  }
});

export default router;
