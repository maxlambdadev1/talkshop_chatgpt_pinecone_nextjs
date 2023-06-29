import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import mongoose from 'mongoose';
import { PromptModel, IPrompt } from '@/models/Prompt';

const PromptModelTyped = PromptModel as mongoose.Model<IPrompt>;


async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).send('Method not allowed');
    return;
  }

  const promptId = req.body.promptId as string;

  if (!promptId ) {
    res.status(400).send('Bad request: promptId is required');
    return;
  }

  try {
    await connectDB();

    await PromptModelTyped.findByIdAndDelete(promptId);

    res.status(200).send('Prompt deleted successfully');
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
