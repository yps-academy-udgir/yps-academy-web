export type NotificationType = 'info' | 'warning' | 'announcement' | 'fee_due';

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetRoles: string[];
  createdBy: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPage {
  items: AppNotification[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  targetRoles: string[];
}
