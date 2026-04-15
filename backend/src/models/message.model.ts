/**
 * Message Model
 * Mongoose schema for classroom messages, read receipts, and attachments
 */

import mongoose, { Schema, Document } from 'mongoose';

// Attachment Interface
export interface IAttachment {
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'document' | 'video';
  fileSize: number; // in bytes
}

// Read Receipt Interface
export interface IReadReceipt {
  userId: string; // User ID (userId from Auth model, not ObjectId)
  readAt: Date;
}

// Message Document Interface
export interface IMessage extends Document {
  classroomId: mongoose.Types.ObjectId;
  senderId: string; // User ID from Auth model (not ObjectId)
  senderRole: 'student' | 'faculty' | 'admin';
  senderName: string; // Cached for quick display
  senderAvatar?: string; // Optional avatar URL
  messageText: string;
  attachments: IAttachment[];
  readBy: IReadReceipt[];
  createdAt: Date;
  updatedAt: Date;
}

// Attachment Schema
const AttachmentSchema = new Schema<IAttachment>(
  {
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      enum: ['image', 'document', 'video'],
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
  },
  { _id: false }
);

// Read Receipt Schema
const ReadReceiptSchema = new Schema<IReadReceipt>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Message Schema
const MessageSchema = new Schema<IMessage>(
  {
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: [true, 'Classroom ID is required'],
      index: true,
    },
    senderId: {
      type: String,
      required: [true, 'Sender ID is required'],
      index: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      required: [true, 'Sender role is required'],
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
    },
    senderAvatar: {
      type: String,
      default: null,
    },
    messageText: {
      type: String,
      required: [true, 'Message text is required'],
      minlength: [1, 'Message cannot be empty'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
      validate: {
        validator: (attachments: IAttachment[]) => attachments.length <= 5,
        message: 'Maximum 5 attachments per message',
      },
    },
    readBy: {
      type: [ReadReceiptSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Index for efficient queries
MessageSchema.index({ classroomId: 1, createdAt: -1 });
MessageSchema.index({ classroomId: 1, senderId: 1 });

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
