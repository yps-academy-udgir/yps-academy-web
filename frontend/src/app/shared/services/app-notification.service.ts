import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';
import { AppNotification, CreateNotificationPayload, NotificationPage } from '../models/notification.model';

const API = `${environment.apiUrl}/notifications`;

@Injectable({ providedIn: 'root' })
export class AppNotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  loading = signal(false);

  /** IDs of notifications already read by this user */
  private get currentUserId() { return this.authService.currentUser()?.userId ?? ''; }

  unread = computed(() =>
    this.notifications().filter((n) => !n.readBy.includes(this.currentUserId))
  );

  constructor() {
    // Auto-refresh count when user logs in
    effect(() => {
      const user = this.authService.currentUser();
      if (user) this.loadUnreadCount();
    });
  }

  load(page = 1, limit = 20) {
    this.loading.set(true);
    return this.http.get<{ success: boolean; data: AppNotification[]; pagination: any }>(API, {
      params: { page, limit },
    }).pipe(
      tap((res) => {
        if (page === 1) this.notifications.set(res.data);
        else this.notifications.update((prev) => [...prev, ...res.data]);
        this.loading.set(false);
        // Sync local unread count from loaded data
        const uid = this.currentUserId;
        const unread = res.data.filter((n) => !n.readBy.includes(uid)).length;
        this.unreadCount.set(unread);
      })
    );
  }

  loadUnreadCount() {
    return this.http.get<{ success: boolean; data: { count: number } }>(`${API}/unread-count`).pipe(
      tap((res) => this.unreadCount.set(res.data.count))
    ).subscribe({ error: () => {} }); // silent — header should never break
  }

  markRead(id: string) {
    return this.http.patch(`${API}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update((list) =>
          list.map((n) => n._id === id ? { ...n, readBy: [...n.readBy, this.currentUserId] } : n)
        );
        this.unreadCount.update((c) => Math.max(0, c - 1));
      })
    ).subscribe();
  }

  markAllRead() {
    return this.http.patch(`${API}/mark-all-read`, {}).pipe(
      tap(() => {
        const uid = this.currentUserId;
        this.notifications.update((list) =>
          list.map((n) => n.readBy.includes(uid) ? n : { ...n, readBy: [...n.readBy, uid] })
        );
        this.unreadCount.set(0);
      })
    ).subscribe();
  }

  /** Push a real-time notification received via socket into the local list */
  pushIncoming(notification: AppNotification) {
    const uid = this.currentUserId;
    const myRole = this.authService.currentUser()?.role;
    if (!myRole || !notification.targetRoles.includes(myRole)) return;
    this.notifications.update((list) => [notification, ...list]);
    if (!notification.readBy.includes(uid)) {
      this.unreadCount.update((c) => c + 1);
    }
  }

  // Admin: send
  send(payload: CreateNotificationPayload) {
    return this.http.post<{ success: boolean; data: AppNotification }>(API, payload);
  }

  // Admin: delete
  delete(id: string) {
    return this.http.delete(`${API}/${id}`).pipe(
      tap(() => this.notifications.update((list) => list.filter((n) => n._id !== id)))
    );
  }

  // Push subscription
  getVapidPublicKey() {
    return this.http.get<{ success: boolean; data: { key: string } }>(`${API}/vapid-public-key`);
  }

  savePushSubscription(sub: PushSubscriptionJSON) {
    return this.http.post(`${API}/push-subscription`, { subscription: sub });
  }

  removePushSubscription() {
    return this.http.delete(`${API}/push-subscription`);
  }
}
