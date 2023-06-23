import mongoose, { Document } from 'mongoose';

export interface IChat extends Document {
  title : string;
  userEmail: string;
}

const ChatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const ChatModel = mongoose.models.Chat
  ? mongoose.model('Chat')
  : mongoose.model<IChat>('Chat', ChatSchema);
