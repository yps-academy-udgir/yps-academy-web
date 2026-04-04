/**
 * Chat Service
 * Signal-based state management for classroom messaging
 * Handles REST API calls and Socket.io event subscriptions
 */

import { Injectable, signal, effect, inject, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocketService } from '../../core/services/socket.service';
import { Message, PaginatedMessageResponse, UnreadCounts } from '../models/message.model';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly API_URL = `${environment.apiUrl}/classrooms`;
  private readonly MESSAGES_API = `${environment.apiUrl}/messages`;

  // State signals
  messagesMap = signal(new Map<string, Message[]>());
  loadingByClassroom = signal(new Map<string, boolean>());
  errorByClassroom = signal(new Map<string, string | null>());
  unreadCountsMap = signal(new Map<string, number>());

  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  constructor() {
    // Initialize Socket.io connection when service is created
    this.socketService.connect();

    // Setup Socket.io event listeners
    this.setupSocketListeners();
  }

  /**
   * Get messages for a specific classroom (REST API)
   */
  getClassroomMessages(
    classroomId: string,
    page: number = 1,
    limit: number = 50,
    forceRefresh: boolean = false
  ): Observable<PaginatedMessageResponse> {
    let params = new HttpParams();
    params = params.set('page', page.toString());
    params = params.set('limit', limit.toString());

    let headers = new HttpHeaders();
    if (forceRefresh) {
      params = params.set('_t', Date.now().toString());
      headers = headers
        .set('Cache-Control', 'no-cache, no-store, must-revalidate')
        .set('Pragma', 'no-cache')
        .set('Expires', '0');
    }

    return this.http.get<PaginatedMessageResponse>(
      `${this.API_URL}/${classroomId}/messages`,
      { params, headers }
    );
  }

  /**
   * Load messages for a classroom and update state
   */
  loadClassroomMessages(
    classroomId: string,
    page: number = 1,
    limit: number = 50,
    forceRefresh: boolean = false
  ): void {
    // Set loading state
    const loadingMap = new Map(this.loadingByClassroom());
    loadingMap.set(classroomId, true);
    this.loadingByClassroom.set(loadingMap);

    this.getClassroomMessages(classroomId, page, limit, forceRefresh).subscribe({
      next: (response) => {
        // Update messages
        const map = new Map(this.messagesMap());
        map.set(classroomId, response.data);
        this.messagesMap.set(map);

        // Clear error
        const errorMap = new Map(this.errorByClassroom());
        errorMap.set(classroomId, null);
        this.errorByClassroom.set(errorMap);

        // Clear loading
        const loMap = new Map(this.loadingByClassroom());
        loMap.set(classroomId, false);
        this.loadingByClassroom.set(loMap);

        // Announce we joined this classroom for Socket.io
        this.socketService.joinClassroom(classroomId);
      },
      error: (err) => {
        // Set error
        const errorMap = new Map(this.errorByClassroom());
        errorMap.set(classroomId, err?.error?.message || 'Failed to load messages');
        this.errorByClassroom.set(errorMap);

        // Clear loading
        const loMap = new Map(this.loadingByClassroom());
        loMap.set(classroomId, false);
        this.loadingByClassroom.set(loMap);
      },
    });
  }

  /**
   * Force refresh chat messages from API for current classroom.
   */
  refreshClassroomMessages(classroomId: string): void {
    this.loadClassroomMessages(classroomId, 1, 50, true);
    this.loadUnreadCounts();
  }

  /**
   * Send a message — Socket.io when connected, REST fallback otherwise.
   * Returns an Observable that completes when REST is used, or null for socket.
   */
  sendMessage(
    classroomId: string,
    messageText: string,
    attachments?: any[]
  ): Observable<{ data: Message }> | null {
    if (!messageText.trim()) {
      return null;
    }

    if (this.socketService.connected()) {
      // Preferred: emit via Socket.io (server will broadcast back via message:new)
      this.socketService.sendMessage(classroomId, messageText, attachments);
      return null;
    }

    // Fallback: REST API
    return this.sendMessageRest(classroomId, messageText, attachments);
  }

  /**
   * Send a message via REST (alternative if Socket.io fails)
   */
  sendMessageRest(
    classroomId: string,
    messageText: string,
    attachments?: any[]
  ): Observable<{ data: Message }> {
    return this.http.post<{ data: Message }>(
      `${this.API_URL}/${classroomId}/messages`,
      { classroomId, messageText, attachments }
    );
  }

  /**
   * Mark a message as read
   */
  markMessageAsRead(messageId: string, classroomId: string): void {
    // Via Socket.io if connected
    if (this.socketService.connected()) {
      this.socketService.markAsRead(messageId, classroomId);
    } else {
      // Fallback to REST
      this.http.put(
        `${this.API_URL}/${classroomId}/messages/${messageId}/read`,
        {}
      ).subscribe();
    }
  }

  /**
   * Load unread counts for all classrooms
   */
  loadUnreadCounts(): void {
    this.http.get<{ data: UnreadCounts }>(
      `${this.MESSAGES_API}/unread-counts`
    ).subscribe({
      next: (response) => {
        // Convert to Map
        const map = new Map<string, number>();
        Object.entries(response.data).forEach(([classroomId, count]) => {
          map.set(classroomId, count as number);
        });
        this.unreadCountsMap.set(map);
      },
      error: (err) => {
        console.error('Failed to load unread counts:', err);
      },
    });
  }

  /**
   * Get computed classrooms with unread counts
   */
  getClassroomsWithUnreadCounts(classrooms: any[]): Array<{ classroom: any; unreadCount: number }> {
    const counts = this.unreadCountsMap();
    return classrooms.map((classroom) => ({
      classroom,
      unreadCount: counts.get(classroom._id) || 0,
    }));
  }

  /**
   * Setup Socket.io event listeners
   */
  private setupSocketListeners(): void {
    // Listen for new messages
    this.socketService.onMessageReceived((message: Message) => {
      // Run inside Angular zone so OnPush components re-render
      this.ngZone.run(() => {
        const classroomId = message.classroomId;
        const map = new Map(this.messagesMap());
        const messages = map.get(classroomId) || [];

        // Check if message already exists (avoid duplicates from REST + Socket)
        if (!messages.some((m) => m._id === message._id)) {
          messages.push(message);
        }

        map.set(classroomId, messages);
        this.messagesMap.set(map);

        // Update unread count if sender is not current user
        const currentUserId = this.authService.currentUser()?._id || this.authService.currentUser()?.userId;
        const senderIsCurrentUser = message.senderId === currentUserId;

        if (!senderIsCurrentUser) {
          const unreadMap = new Map(this.unreadCountsMap());
          const currentCount = unreadMap.get(classroomId) || 0;
          unreadMap.set(classroomId, currentCount + 1);
          this.unreadCountsMap.set(unreadMap);
        }
      });
    });

    // Listen for read receipts
    this.socketService.onMessageRead((data: any) => {
      this.ngZone.run(() => {
        const { messageId, classroomId, userId } = data;
        const map = new Map(this.messagesMap());
        const messages = map.get(classroomId) || [];

        const message = messages.find((m) => m._id === messageId);
        if (message) {
          // Add to readBy if not already there
          if (!message.readBy.some((r) => r.userId === userId)) {
            message.readBy.push({ userId, readAt: new Date() });
          }
        }

        map.set(classroomId, messages);
        this.messagesMap.set(map);

        // Decrement unread count if user is current user
        const currentUserId = this.authService.currentUser()?._id || this.authService.currentUser()?.userId;
        if (userId === currentUserId) {
          const unreadMap = new Map(this.unreadCountsMap());
          const currentCount = unreadMap.get(classroomId) || 0;
          if (currentCount > 0) {
            unreadMap.set(classroomId, currentCount - 1);
          }
          this.unreadCountsMap.set(unreadMap);
        }
      });
    });

    // Listen for errors
    this.socketService.onSocketError((error: any) => {
      console.error('[Chat Service] Socket error:', error);
    });
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    this.socketService.removeAllListeners();
    this.socketService.disconnect();
  }
}
