/**
 * Socket Service
 * Wrapper around Socket.io client for real-time communication
 */

import { Injectable, signal, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  connected = signal(false);
  private joinedRooms = new Set<string>();

  private authService = inject(AuthService);

  constructor() {}

  /**
   * Connect to Socket.io server with JWT authentication
   */
  connect(): void {
    if (this.socket?.connected) {
      return; // Already connected
    }

    const token = this.authService.getToken();
    if (!token) {
      return; // Can't connect without token
    }

    this.socket = io(environment.apiUrl.replace('/api', ''), {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.connected.set(true);
      console.log('[Socket] Connected to server');
      // Re-join any rooms that were registered before connection was ready
      this.joinedRooms.forEach(classroomId => {
        this.socket!.emit('classroom:join', { classroomId });
      });
    });

    this.socket.on('disconnect', () => {
      this.connected.set(false);
      console.log('[Socket] Disconnected from server');
    });

    this.socket.on('error', (error: any) => {
      console.error('[Socket] Error:', error);
    });
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connected.set(false);
    }
  }

  /**
   * Disconnect any existing connection and reconnect with the current token.
   * Called after a login/logout to ensure the socket is authenticated as the
   * new user. Previously-joined rooms are re-joined automatically via the
   * connect() → 'connect' handler.
   */
  reconnect(): void {
    this.disconnect();
    this.connect();
  }

  /**
   * Join a classroom chat room
   */
  joinClassroom(classroomId: string): void {
    this.joinedRooms.add(classroomId);
    if (!this.socket?.connected) {
      // Will be joined automatically when socket connects
      return;
    }
    this.socket.emit('classroom:join', { classroomId });
  }

  /**
   * Leave a classroom chat room
   */
  leaveClassroom(classroomId: string): void {
    this.joinedRooms.delete(classroomId);
    if (!this.socket) return;
    this.socket.emit('classroom:leave', { classroomId });
  }

  /**
   * Send a message to a classroom
   */
  sendMessage(
    classroomId: string,
    messageText: string,
    attachments?: any[]
  ): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot send message');
      return;
    }
    this.socket.emit('message:send', {
      classroomId,
      messageText,
      attachments: attachments || [],
    });
  }

  /**
   * Mark a message as read
   */
  markAsRead(messageId: string, classroomId: string): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot mark as read');
      return;
    }
    this.socket.emit('message:mark-read', { messageId, classroomId });
  }

  /**
   * Subscribe to new messages
   */
  onMessageReceived(callback: (message: any) => void): void {
    if (!this.socket) return;
    this.socket.on('message:new', callback);
  }

  /**
   * Subscribe to message read receipts
   */
  onMessageRead(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('message:read', callback);
  }

  /**
   * Subscribe to user joined event
   */
  onUserJoined(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('classroom:user-joined', callback);
  }

  /**
   * Subscribe to user left event
   */
  onUserLeft(callback: (data: any) => void): void {
    if (!this.socket) return;
    this.socket.on('classroom:user-left', callback);
  }

  /**
   * Subscribe to socket errors
   */
  onSocketError(callback: (error: any) => void): void {
    if (!this.socket) return;
    this.socket.on('error', callback);
  }

  /**
   * Subscribe to incoming in-app notifications pushed by the server
   */
  onNotification(callback: (notification: any) => void): void {
    if (!this.socket) return;
    this.socket.on('notification:new', callback);
  }

  /**
   * Remove all listeners (cleanup)
   */
  removeAllListeners(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }
}
