import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender_id: mongoose.Types.ObjectId;
  receiver_id: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
}

const MessageSchema: Schema = new Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.model<IMessage>('Message', MessageSchema);
