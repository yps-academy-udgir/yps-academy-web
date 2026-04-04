import { UserRole } from '../../../models/auth.model';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'announcement' | 'fee_due';
  targetRoles: UserRole[];
}

export interface SavePushSubscriptionDto {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
}
