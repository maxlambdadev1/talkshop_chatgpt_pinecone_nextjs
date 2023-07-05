import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import mongoose from 'mongoose';
import { PromptModel, IPrompt } from '@/models/Prompt';
import fs from 'fs';

const PromptModelTyped = PromptModel as mongoose.Model<IPrompt>;

const filePath = process.env.NODE_ENV === 'production' ? '/public/images' : 'public/images';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.status(405).send('Method not allowed');
    return;
  }

  const promptId = req.body.promptId as string;

  if (!promptId) {
    res.status(400).send('Bad request: promptId is required');
    return;
  }

  try {
    await connectDB();
    const prompt: any = await PromptModelTyped.findById(promptId);

    const image = fs.existsSync(`${filePath}/${prompt.image}`);
    if (!!image) fs.unlinkSync(`${filePath}/${prompt.image}`);
    prompt.image = '';
    const updatedPrompt = await PromptModelTyped.findByIdAndUpdate(
      promptId,
      prompt,
      { new: true },
    );
    res.status(200).json(updatedPrompt);
  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).send('Internal server error');
  }
}

export default handler;
