import z from 'zod';

// Attachment DTO
export const AttachmentDtoSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  fileType: z.enum(['image', 'document', 'video']).describe('File type'),
  fileSize: z.number().positive('File size must be greater than 0'),
});

export type AttachmentDto = z.infer<typeof AttachmentDtoSchema>;

// Create Message DTO
export const CreateMessageDtoSchema = z.object({
  classroomId: z.string().min(24, 'Invalid classroom ID'),
  messageText: z.string().min(1, 'Message cannot be empty').max(5000, 'Message cannot exceed 5000 characters'),
  attachments: z.array(AttachmentDtoSchema).max(5, 'Maximum 5 attachments per message').optional(),
});

export type CreateMessageDto = z.infer<typeof CreateMessageDtoSchema>;

// Read Receipt DTO
export const MarkAsReadDtoSchema = z.object({
  messageId: z.string().min(24, 'Invalid message ID'),
});

export type MarkAsReadDto = z.infer<typeof MarkAsReadDtoSchema>;

// Message Response DTO (what we return to frontend)
export interface MessageResponseDto {
  _id: string;
  classroomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'faculty';
  senderAvatar?: string;
  messageText: string;
  attachments: AttachmentDto[];
  readBy: Array<{
    userId: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Unread Count Response
export interface UnreadCountsDto {
  [classroomId: string]: number; // classroomId -> count
}
