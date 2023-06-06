import { initPinecone } from '@/utils/pinecone-client';
import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/mongoConnection';
import Namespace from '@/models/Namespace';
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

  const pineconeApiKey = req.headers['x-api-key'];
  const targetIndex = req.headers['x-index-name'] as string;
  const pineconeEnvironment = req.headers['x-environment'];

  const pinecone = await initPinecone(
    pineconeApiKey as string,
    pineconeEnvironment as string,
  );

  try {
    await connectDB();
    const existingNamespace = await Namespace.findOne({
      name: namespace as string,
      userEmail : userEmail  as string
    });
    if (!existingNamespace) await Namespace.deleteOne({ name: namespace, userEmail });
    else return res.status(400).json({message : "You cann't delete the namespace"});
    
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


    res.status(200).json({ message: 'Namespace deleted successfully.' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Failed to delete namespace.' });
  }
}
