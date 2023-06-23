import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../utils/mongoConnection';
import { ChatModel, IChat } from '@/models/ChatModel';
import mongoose from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {

  const ChatModelTyped = ChatModel as mongoose.Model<IChat>;

  const userEmail = req.query.userEmail as string;

  if (!userEmail) {
    res.status(400).send('Bad request: userEmail is required');
    return;
  }

  try {
    await connectDB();
    const chatList = await ChatModelTyped.find({ userEmail }).sort({createdAt : -1}); //desc
    res.status(200).json(chatList);
  } catch (error) {
    console.error('Error getting chatList:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
