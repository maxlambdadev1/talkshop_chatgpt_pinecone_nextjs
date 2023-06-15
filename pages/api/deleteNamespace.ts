import { initPinecone } from '@/utils/pinecone-client';
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import Namespace from '@/models/Namespace';
import { ChatModel, IChat } from '@/models/ChatModel';
import Message from '@/models/Message';
import SFile from '@/models/SFile';
import mongoose from 'mongoose';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userEmail = session?.user?.email;

  const { namespace } = req.query as {
    namespace: string;
  };

  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const targetIndex = process.env.PINECONE_INDEX_NAME as string;
  const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;

  const pinecone = await initPinecone(
    pineconeApiKey as string,
    pineconeEnvironment as string,
  );

  try {
    await connectDB();
    const existingNamespace = await Namespace.findOne({
      realName: namespace as string,
      userEmail: userEmail as string,
    });
    if (!existingNamespace) {
      return res.status(400).json({ message: "You cann't delete the namespace" });
    }

    if (!pinecone) {
      return res.status(400).json({ message: 'There is no correct pinecone' });
    }

    const index = pinecone.Index(targetIndex);
    await index._delete({
      deleteRequest: {
        namespace,
        deleteAll: true,
      },
    });

    const ChatModelTyped = ChatModel as mongoose.Model<IChat>;
    await Namespace.deleteOne({ realName: namespace, userEmail });
    await ChatModelTyped.deleteMany({  namespace, userEmail });
    await Message.deleteMany({ namespace, userEmail });
    await SFile.deleteMany({ namespace });

    res.status(200).json({ message: 'Namespace deleted successfully.' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Failed to delete namespace.' });
  }
}
