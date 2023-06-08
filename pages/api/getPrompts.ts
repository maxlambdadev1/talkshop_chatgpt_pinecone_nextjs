import { NextApiRequest, NextApiResponse } from 'next';
import { initPinecone } from '@/utils/pinecone-client';
import connectDB from '@/utils/mongoConnection';
import { getSession } from 'next-auth/react';
import AIPrompt from '@/models/AIPrompt';

const getPrompts = async (req: NextApiRequest, res: NextApiResponse) => {
 
  const {dataName, categoryName } = req.query;
  if (!dataName || !categoryName) return res.status(400).json({message : 'Please input the dataName, categoryName.'})

  try {
    await connectDB();
    const prompts = await AIPrompt.find({dataName, categoryName }).sort({prompt : 1}); //asc

    res.status(200).json([...prompts]);

  } catch (err) {
    console.log('getPrompts error', err);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

export default getPrompts;
