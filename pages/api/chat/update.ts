import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import { ChatModel, IChat } from '@/models/ChatModel';
import Message from '@/models/Message';
import mongoose from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.status(405).send('Method not allowed');
    return;
  }
  const ChatModelTyped = ChatModel as mongoose.Model<IChat>;

  const chatId = req.body.chatId as string;
  const title = req.body.title as string;

  if (!chatId || !title) {
    res.status(400).send('Bad request: chatId , title are required');
    return;
  }

  try {
    await connectDB();
    const result = await ChatModelTyped.findByIdAndUpdate(chatId,  {title });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
