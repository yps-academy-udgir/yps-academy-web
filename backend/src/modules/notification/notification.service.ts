import webpush from 'web-push';
import { notificationRepository } from './notification.repository';
import { UserRole } from '../../models/auth.model';
import type { CreateNotificationDto, SavePushSubscriptionDto } from './dto/notification.dto';
import logger from '../../utils/logger';

// Configure VAPID with env vars (generated once via `npx web-push generate-vapid-keys`)
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@ypsacademy.in';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

function serviceError(message: string, statusCode: number) {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export const notificationService = {
  async create(dto: CreateNotificationDto, createdById: string, io?: any) {
    if (!dto.title?.trim()) throw serviceError('Title is required', 400);
    if (!dto.message?.trim()) throw serviceError('Message is required', 400);
    if (!dto.targetRoles?.length) throw serviceError('At least one target role is required', 400);

    const notification = await notificationRepository.create(dto, createdById);

    // Emit real-time socket event to all connected users with matching roles
    if (io) {
      io.emit('notification:new', notification);
    }

    // Send browser push notifications (best-effort — don't fail the request)
    notificationService.sendPush(dto).catch((err) =>
      logger.warn(`Push notification failed: ${err.message}`)
    );

    return notification;
  },

  async getForUser(role: UserRole, userId: string, page: number, limit: number) {
    return notificationRepository.findForUser(role, userId, page, limit);
  },

  async getAll(page: number, limit: number) {
    return notificationRepository.findAll(page, limit);
  },

  async markRead(notificationId: string, userId: string) {
    return notificationRepository.markRead(notificationId, userId);
  },

  async markAllRead(role: UserRole, userId: string) {
    return notificationRepository.markAllRead(role, userId);
  },

  async deleteNotification(notificationId: string) {
    const result = await notificationRepository.deleteById(notificationId);
    if (!result) throw serviceError('Notification not found', 404);
    return result;
  },

  async countUnread(role: UserRole, userId: string) {
    return notificationRepository.countUnread(role, userId);
  },

  async savePushSubscription(userId: string, role: UserRole, dto: SavePushSubscriptionDto) {
    return notificationRepository.savePushSubscription(userId, role, dto);
  },

  async removePushSubscription(userId: string) {
    return notificationRepository.removePushSubscription(userId);
  },

  async sendPush(dto: CreateNotificationDto) {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) return; // VAPID not configured

    const subscriptions = await notificationRepository.getPushSubscriptionsForRoles(dto.targetRoles);
    const payload = JSON.stringify({ title: dto.title, body: dto.message, type: dto.type });

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(sub.subscription as any, payload).catch((err) => {
          logger.warn(`Push to ${sub.userId} failed (${err.statusCode}): removing stale sub`);
          if (err.statusCode === 410) {
            // Subscription expired — remove from DB
            notificationRepository.removePushSubscription(sub.userId).catch(() => {});
          }
        })
      )
    );
  },
};
