import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { successResponse, errorResponse } from '../../utils/response.util';
import { UserRole } from '../../models/auth.model';

// Injected via closure when routes are set up
let ioInstance: any;
export function setIo(io: any) { ioInstance = io; }

export const notificationController = {
  // POST /notifications  (admin only)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, message, type, targetRoles } = req.body;
      const createdById = req.user!._id;
      const notification = await notificationService.create(
        { title, message, type, targetRoles },
        createdById,
        ioInstance
      );
      successResponse(res, notification, 'Notification sent', 201);
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // GET /notifications  (own role inbox)
  async getMyNotifications(req: Request, res: Response): Promise<void> {
    try {
      const role = req.user!.role as UserRole;
      const userId = req.user!.userId;
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const result = await notificationService.getForUser(role, userId, page, limit);
      res.json({ success: true, data: result.items, pagination: { total: result.total, page, limit } });
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // GET /notifications/all  (admin — see everything)
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 20;
      const result = await notificationService.getAll(page, limit);
      res.json({ success: true, data: result.items, pagination: { total: result.total, page, limit } });
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // GET /notifications/unread-count
  async unreadCount(req: Request, res: Response): Promise<void> {
    try {
      const role = req.user!.role as UserRole;
      const userId = req.user!.userId;
      const count = await notificationService.countUnread(role, userId);
      successResponse(res, { count });
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // PATCH /notifications/:id/read
  async markRead(req: Request, res: Response): Promise<void> {
    try {
      await notificationService.markRead(req.params['id'], req.user!.userId);
      successResponse(res, null, 'Marked as read');
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // PATCH /notifications/mark-all-read
  async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      const role = req.user!.role as UserRole;
      await notificationService.markAllRead(role, req.user!.userId);
      successResponse(res, null, 'All marked as read');
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // DELETE /notifications/:id  (admin only)
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      await notificationService.deleteNotification(req.params['id']);
      successResponse(res, null, 'Notification deleted');
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // POST /notifications/push-subscription
  async savePushSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscription } = req.body;
      const userId = req.user!.userId;
      const role = req.user!.role as UserRole;
      await notificationService.savePushSubscription(userId, role, { subscription });
      successResponse(res, null, 'Push subscription saved');
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // DELETE /notifications/push-subscription
  async removePushSubscription(req: Request, res: Response): Promise<void> {
    try {
      await notificationService.removePushSubscription(req.user!.userId);
      successResponse(res, null, 'Push subscription removed');
    } catch (err: any) {
      errorResponse(res, err.message, err.statusCode || 500);
    }
  },

  // GET /notifications/vapid-public-key
  getVapidPublicKey(_req: Request, res: Response): void {
    const key = process.env.VAPID_PUBLIC_KEY || '';
    successResponse(res, { key });
  },
};
