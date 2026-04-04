import { Router } from 'express';
import { notificationController } from './notification.controller';
import { verifyToken, requireRoles } from '../../middleware/auth.middleware';

const router = Router();

// All routes require auth
router.use(verifyToken);

// Public key for push (no auth required — but placing after verifyToken is fine too)
router.get('/vapid-public-key', notificationController.getVapidPublicKey);

// Inbox routes (any logged-in role)
router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.unreadCount);
router.patch('/mark-all-read', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

// Push subscription
router.post('/push-subscription', notificationController.savePushSubscription);
router.delete('/push-subscription', notificationController.removePushSubscription);

// Admin routes
router.post('/', requireRoles('admin'), notificationController.create);
router.get('/all', requireRoles('admin'), notificationController.getAll);
router.delete('/:id', requireRoles('admin'), notificationController.deleteNotification);

export default router;
