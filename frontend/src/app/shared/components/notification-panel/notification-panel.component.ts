import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppNotificationService } from '../../services/app-notification.service';
import { SocketService } from '../../../core/services/socket.service';
import { RoleService } from '../../services/role.service';
import { AppNotification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  private notificationService = inject(AppNotificationService);
  private socketService = inject(SocketService);
  private router = inject(Router);
  roleService = inject(RoleService);

  notifications = this.notificationService.notifications;
  loading = this.notificationService.loading;
  unreadCount = this.notificationService.unreadCount;

  private get currentUserId() { return this.notificationService['currentUserId']; }

  ngOnInit() {
    this.notificationService.load().subscribe();
    this.socketService.onNotification((n) => this.notificationService.pushIncoming(n));
  }

  ngOnDestroy() {
    // socket listener cleaned up when socket reconnects/disconnects
  }

  isUnread(n: AppNotification): boolean {
    return !n.readBy.includes(this.currentUserId);
  }

  markRead(n: AppNotification, event: Event) {
    event.stopPropagation();
    if (!this.isUnread(n)) return;
    this.notificationService.markRead(n._id);
  }

  markAllRead() {
    this.notificationService.markAllRead();
  }

  goToSend() {
    this.router.navigate(['/notifications/send']);
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      info: 'info',
      warning: 'warning_amber',
      announcement: 'campaign',
      fee_due: 'payments',
    };
    return map[type] ?? 'notifications';
  }

  typeClass(type: string): string {
    return `type-${type}`;
  }
}
