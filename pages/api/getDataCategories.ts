import { NextApiRequest, NextApiResponse } from 'next';
import { initPinecone } from '@/utils/pinecone-client';
import connectDB from '@/utils/mongoConnection';
import { getSession } from 'next-auth/react';
import AIData from '@/models/AIData';
import AICategory from '@/models/AICategory';

const getDataCategories = async (req: NextApiRequest, res: NextApiResponse) => {

  try {
    await connectDB();
    const data = await AIData.find({}).sort({dataName : 1}); //asc
    const categories = await AICategory.find({}).sort({categoryName : 1});

    res.status(200).json({data, categories});

  } catch (err) {
    console.log('getDataCategories error', err);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

export default getDataCategories;
