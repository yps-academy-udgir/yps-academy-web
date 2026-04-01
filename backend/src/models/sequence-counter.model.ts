import mongoose, { Schema, Document } from 'mongoose';

export interface ISequenceCounter extends Document {
  key: string;
  value: number;
  updatedAt: Date;
}

const SequenceCounterSchema = new Schema<ISequenceCounter>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  }
);

export const SequenceCounter = mongoose.model<ISequenceCounter>('SequenceCounter', SequenceCounterSchema);
