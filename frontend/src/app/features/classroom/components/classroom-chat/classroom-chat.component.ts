/**
 * Classroom Chat Component
 * Displays and manages messages for a specific classroom
 * Supports text messages, attachments, and read receipts
 */

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  effect,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChatService } from '../../../../shared/services/chat.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Message } from '../../../../shared/models/message.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-classroom-chat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './classroom-chat.component.html',
  styleUrls: ['./classroom-chat.component.scss'],
})
export class ClassroomChatComponent implements OnInit, OnDestroy {
  private readonly MAX_ATTACHMENTS = 5;
  private readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

  @Input() classroomId!: string;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  messageForm!: FormGroup;
  uploadedAttachments: any[] = [];
  sending = false;
  refreshing = false;

  /** Messages for the current classroom, each enriched with `isMine`.
   *  Recomputed reactively whenever messagesMap or currentUser changes,
   *  so bubble alignment is always correct after a login switch. */
  readonly enrichedMessages = computed(() => {
    const uid = this.authService.currentUser()?._id
      || this.authService.currentUser()?.userId
      || '';
    return (this.chatService.messagesMap().get(this.classroomId) ?? []).map(msg => ({
      ...msg,
      isMine: msg.senderId === uid,
    }));
  });

  private readonly _prevUserId = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Auto-scroll to bottom when messages update
    effect(
      () => {
        this.enrichedMessages(); // Trigger when messages change
        setTimeout(() => this.scrollToBottom(), 0);
      },
      { allowSignalWrites: true }
    );

    // Reload messages when the logged-in user changes (e.g. after login switch).
    // This ensures isSentByCurrentUser re-evaluates for all existing messages.
    effect(
      () => {
        const user = this.authService.currentUser();
        const uid = user?._id || user?.userId || null;
        const prev = this._prevUserId();
        if (uid !== prev) {
          this._prevUserId.set(uid);
          if (uid && this.classroomId) {
            this.chatService.loadClassroomMessages(this.classroomId, 1, 50, true);
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  // From chat service (lazy-loaded getters)
  get messages() {
    return this.chatService.messagesMap;
  }

  get isLoading() {
    return this.chatService.loadingByClassroom;
  }

  get error() {
    return this.chatService.errorByClassroom;
  }

  // Current user
  get currentUserId(): string {
    return this.authService.currentUser()?._id || this.authService.currentUser()?.userId || '';
  }

  get currentUserName(): string {
    return this.authService.currentUser()?.name || '';
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadMessages();
  }

  ngOnDestroy(): void {
    if (this.classroomId) {
      // Leave classroom on component destroy
      // (optional - can keep connection open)
    }
  }

  /**
   * Initialize message form
   */
  private initializeForm(): void {
    this.messageForm = this.fb.group({
      messageText: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(5000)]],
    });
  }

  /**
   * Load messages for the classroom
   */
  private loadMessages(): void {
    this.chatService.loadClassroomMessages(this.classroomId, 1, 50);
  }

  /**
   * Get messages for current classroom (enriched with isMine)
   */
  getClassroomMessages() {
    return this.enrichedMessages();
  }

  /**
   * Check if classroom is loading
   */
  isClassroomLoading(): boolean {
    return this.isLoading().get(this.classroomId) ?? false;
  }

  /**
   * Get error for classroom
   */
  getClassroomError(): string | null {
    return this.error().get(this.classroomId) ?? null;
  }

  /**
   * Send message
   */
  sendMessage(): void {
    if (this.messageForm.invalid || this.sending) {
      return;
    }

    const messageText = this.messageForm.get('messageText')?.value?.trim();
    if (!messageText) {
      return;
    }

    this.sending = true;
    const result = this.chatService.sendMessage(this.classroomId, messageText, this.uploadedAttachments);

    if (result === null) {
      // Sent via Socket.io — server will broadcast message:new back
      this.messageForm.reset();
      this.uploadedAttachments = [];
      this.sending = false;
    } else {
      // REST fallback
      result.subscribe({
        next: () => {
          this.messageForm.reset();
          this.uploadedAttachments = [];
          // Reload so the new message appears
          this.chatService.refreshClassroomMessages(this.classroomId);
        },
        error: (error: any) => {
          this.notificationService.error(error?.error?.message || 'Failed to send message');
        },
        complete: () => {
          this.sending = false;
        },
      });
    }
  }

  /**
   * Trigger file upload
   */
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files) {
      return;
    }

    const availableSlots = this.MAX_ATTACHMENTS - this.uploadedAttachments.length;
    if (availableSlots <= 0) {
      this.notificationService.error(`You can upload up to ${this.MAX_ATTACHMENTS} files per message.`);
      input.value = '';
      return;
    }

    const selectedFiles = Array.from(files);
    if (selectedFiles.length > availableSlots) {
      this.notificationService.error(
        `You can add only ${availableSlots} more file${availableSlots > 1 ? 's' : ''} (max ${this.MAX_ATTACHMENTS}).`
      );
    }

    const filesToProcess = selectedFiles.slice(0, availableSlots);

    for (const file of filesToProcess) {
      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        this.notificationService.error(
          `${file.name} exceeds the 10 MB limit and was not added.`
        );
        continue;
      }

      // For now, just add file info (in real app, upload to server first)
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment = {
          fileName: file.name,
          fileUrl: e.target?.result as string,
          fileType: this.getFileType(file.type),
          fileSize: file.size,
        };
        this.uploadedAttachments.push(attachment);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    input.value = '';
  }

  /**
   * Determine file type from MIME type
   */
  private getFileType(mimeType: string): 'image' | 'document' | 'video' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else {
      return 'document';
    }
  }

  /**
   * Remove attachment from upload list
   */
  removeAttachment(index: number): void {
    this.uploadedAttachments.splice(index, 1);
  }

  /**
   * Check if current user sent message — delegates to pre-computed isMine flag.
   */
  isSentByCurrentUser(message: { isMine?: boolean; senderId: string }): boolean {
    return message.isMine ?? (message.senderId === this.currentUserId);
  }

  /**
   * Format time as HH:MM for display inside message bubble
   */
  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Scroll to bottom of messages
   */
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  /**
   * Retry loading messages
   */
  retryLoadMessages(): void {
    this.loadMessages();
  }

  /**
   * Force refresh latest messages from API.
   */
  refreshMessages(): void {
    if (this.refreshing || !this.classroomId) {
      return;
    }

    this.refreshing = true;
    this.chatService.refreshClassroomMessages(this.classroomId);

    // `loadClassroomMessages` is signal-driven; clear local refresh state shortly after trigger.
    setTimeout(() => {
      this.refreshing = false;
    }, 1000);
  }

  /**
   * Returns tooltip text listing names of users who read a message
   */
  getReadByTooltip(message: Message): string {
    if (!message.readBy || message.readBy.length === 0) return '';
    return 'Read by: ' + message.readBy.map((r) => r.userId).join(', ');
  }

  /** Returns 1–2 uppercase initials from a full name */
  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private readonly avatarColors = [
    '#128C7E', '#6B3FA0', '#E84393', '#E05C2C', '#1E88E5', '#43A047',
  ];

  /** Deterministic avatar background colour based on sender name */
  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  /** True when this message is the first of a new calendar day */
  shouldShowDateSeparator(message: Message, index: number): boolean {
    if (index === 0) return true;
    const prev = this.getClassroomMessages()[index - 1];
    return (
      new Date(prev.createdAt).toDateString() !==
      new Date(message.createdAt).toDateString()
    );
  }

  /** Human-friendly label for the date separator */
  formatDateSeparator(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /** Send on Enter; allow Shift+Enter for newline */
  onEnterKey(event: Event): void {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
