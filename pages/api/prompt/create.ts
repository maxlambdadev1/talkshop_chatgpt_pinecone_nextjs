import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import mongoose from 'mongoose';

import { PromptModel, IPrompt } from '@/models/Prompt';

const PromptModelTyped = PromptModel as mongoose.Model<IPrompt>;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    await connectDB();

    try {
      const { name, userEmail } = req.body;

      if (!userEmail || !name) return res.status(400).json({message : 'input all data correctly.'})

      const newPrompt = await PromptModelTyped.create({
        name,
        userEmail,
        description : '',
        prompt : '',
        image : ''
      });

      res.status(200).json(newPrompt);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create new prompt' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
