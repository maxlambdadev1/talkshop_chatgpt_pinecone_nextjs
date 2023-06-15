import { NextApiRequest, NextApiResponse } from 'next';
import { initPinecone } from '@/utils/pinecone-client';
import connectDB from '@/utils/mongoConnection';
import { getSession } from 'next-auth/react';
import SFile from '@/models/SFile';

const getFiles = async (req: NextApiRequest, res: NextApiResponse) => {
 
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const {namespace } = req.query;
  if (!namespace) return res.status(400).json({message : 'Please input the namespace'})

  try {
    await connectDB();
    const files = await SFile.find({ namespace }).sort({name : 1}); //asc

    res.status(200).json([...files]);

  } catch (err) {
    console.log('getFiles error', err);
    res.status(500).json({ message: 'Error fetching data' });
  }
};

export default getFiles;
