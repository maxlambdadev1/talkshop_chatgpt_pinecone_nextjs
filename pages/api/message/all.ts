import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../utils/mongoConnection';
import Message from '@/models/Message';

async function handler(req: NextApiRequest, res: NextApiResponse) {

  const namespace = req.query.namespace as string;
  const chatId = req.query.chatId as string;

  if (!chatId || !namespace) {
    res.status(400).send('Bad request: chatId and namespace are required');
    return;
  }

  try {
    await connectDB();
    const Messages = await Message.find({ chatId, namespace});
    res.status(200).json(Messages);
  } catch (error) {
    console.error('Error getting chatList:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
