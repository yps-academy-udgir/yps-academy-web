import { Notification, PushSubscription } from '../../models/notification.model';
import { UserRole } from '../../models/auth.model';
import type { CreateNotificationDto, SavePushSubscriptionDto } from './dto/notification.dto';

export const notificationRepository = {
  async create(dto: CreateNotificationDto, createdById: string) {
    return Notification.create({ ...dto, createdBy: createdById });
  },

  async findForUser(role: UserRole, _userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Notification.find({ targetRoles: role })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ targetRoles: role }),
    ]);
    return { items, total };
  },

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Notification.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(),
    ]);
    return { items, total };
  },

  async markRead(notificationId: string, userId: string) {
    return Notification.updateOne(
      { _id: notificationId },
      { $addToSet: { readBy: userId } }
    );
  },

  async markAllRead(role: UserRole, userId: string) {
    return Notification.updateMany(
      { targetRoles: role, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
  },

  async deleteById(notificationId: string) {
    return Notification.findByIdAndDelete(notificationId);
  },

  async countUnread(role: UserRole, userId: string) {
    return Notification.countDocuments({ targetRoles: role, readBy: { $ne: userId } });
  },

  // Push subscriptions
  async savePushSubscription(userId: string, role: UserRole, dto: SavePushSubscriptionDto) {
    return PushSubscription.findOneAndUpdate(
      { userId },
      { userId, role, subscription: dto.subscription },
      { upsert: true, new: true }
    );
  },

  async removePushSubscription(userId: string) {
    return PushSubscription.deleteOne({ userId });
  },

  async getPushSubscriptionsForRoles(roles: UserRole[]) {
    return PushSubscription.find({ role: { $in: roles } }).lean();
  },
};
