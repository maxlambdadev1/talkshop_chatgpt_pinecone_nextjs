import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../utils/mongoConnection';
import { PromptModel, IPrompt } from '@/models/Prompt';
import mongoose from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {

  const PromptModelTyped = PromptModel as mongoose.Model<IPrompt>;

  const userEmail = req.query.userEmail as string;

  if (!userEmail) {
    res.status(400).send('Bad request: userEmail is required');
    return;
  }

  try {
    await connectDB();
    const promptList = await PromptModelTyped.find({ userEmail }).sort({createdAt : -1}); //desc
    res.status(200).json(promptList);
  } catch (error) {
    console.error('Error getting promptList:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
