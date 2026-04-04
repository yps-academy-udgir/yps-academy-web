import { Routes } from '@angular/router';

export const NOTIFICATION_ROUTES: Routes = [
  {
    path: 'send',
    loadComponent: () =>
      import('./components/send-notification/send-notification.component').then(
        (m) => m.SendNotificationComponent
      ),
    data: { title: 'Send Notification' },
  },
];
