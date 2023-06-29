import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import mongoose from 'mongoose';
import { PromptModel, IPrompt } from '@/models/Prompt';

const PromptModelTyped = PromptModel as mongoose.Model<IPrompt>;


async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.status(405).send('Method not allowed');
    return;
  }

  const promptId = req.body.promptId as string;
  const name = req.body.name as string;
  const description = req.body.description as string;
  const prompt = req.body.prompt as string;

  if (!promptId || !name) {
    res.status(400).send('Bad request: promptId , name are required');
    return;
  }

  try {
    await connectDB();
    const result = await PromptModelTyped.findByIdAndUpdate(promptId,  {name, description, prompt });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
