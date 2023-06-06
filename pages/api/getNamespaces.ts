import { NextApiRequest, NextApiResponse } from 'next';
import { initPinecone } from '@/utils/pinecone-client';
import connectDB from '@/utils/mongoConnection';
import { getSession } from 'next-auth/react';
import Namespace from '@/models/Namespace';

type NamespaceSummary = {
  vectorCount: number;
};

const getNamespaces = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userEmail = session?.user?.email;
  console.log('userEmail',  userEmail);

  const pineconeApiKey = req.headers['x-api-key'];
  const targetIndex = req.headers['x-index-name'] as string;
  const pineconeEnvironment = req.headers['x-environment'];
  
  await connectDB();
  const userNamespaces = await Namespace.find({ userEmail });
  const namespaceNames = userNamespaces.map((namespace) => namespace.name);
  if (!!namespaceNames && namespaceNames.length > 0) {    
    return res.status(200).json(namespaceNames);
  }
  /** if there is no namespaces according to the userEmail,  get from the pinecone. */
  const pinecone = await initPinecone(
    pineconeApiKey as string,
    pineconeEnvironment as string,
  );

  if (!pinecone) {
    return res.status(400).json({ message: 'There is no correct pinecone' });
  }

  try {
    const index = pinecone.Index(targetIndex);

    const describeIndexStatsQuery = {
      describeIndexStatsRequest: {
        filter: {},
      },
    };

    const indexStatsResponse = await index.describeIndexStats(
      describeIndexStatsQuery,
    );
    const namespaces = Object.keys(
      indexStatsResponse.namespaces as { [key: string]: NamespaceSummary },
    );    

    res.status(200).json(namespaces);
  } catch (error) {
    console.log('Error fetching namespaces', error);
    res.status(500).json({ message: 'Error fetching namespaces' });
  }
};

export default getNamespaces;
