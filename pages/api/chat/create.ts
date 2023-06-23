import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import mongoose from 'mongoose';

import { ChatModel, IChat } from '@/models/ChatModel';

const ChatModelTyped = ChatModel as mongoose.Model<IChat>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    await connectDB();

    try {
      const { title, userEmail } = req.body;

      if (!userEmail || !title) return res.status(400).json({message : 'input all data correctly.'})

      const newChat = await ChatModelTyped.create({
        title,
        userEmail,
      });

      res.status(200).json(newChat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create new chat' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
