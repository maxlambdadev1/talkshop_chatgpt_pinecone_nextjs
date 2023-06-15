import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { getSession } from 'next-auth/react';
import { initPinecone } from '@/utils/pinecone-client';

const filePath = process.env.NODE_ENV === 'production' ? '/tmp' : 'tmp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userEmail = session?.user?.email;

  // Delete the PDF, DOCX and TXT files
  const files = fs
    .readdirSync(filePath)
    .filter(
      (file) =>
        file.endsWith('.pdf') ||
        file.endsWith('.docx') ||
        file.endsWith('.txt'),
    );

  const openAIapiKey = process.env.OPENAI_API_KEY;
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const targetIndex = process.env.PINECONE_INDEX_NAME as string;
  const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;

  const pinecone = await initPinecone(
    pineconeApiKey as string,
    pineconeEnvironment as string,
  );
  if (!pinecone) {
    return res.status(400).json({ message: 'There is no correct pinecone' });
  }
  // Get the Pinecone index with the given name
  const index = pinecone.Index(targetIndex);

  const vector1 = [];
  for (let i = 0; i < 1536; i++) {
    vector1.push(0);
  }
  const queryResponse = await index.query({
    queryRequest: {
      namespace: 'e117af26-5624-45b0-a017-277673329aae',
      topK: 10,
        // filter: {
        //   source: { $eq: '\\projects\\doc-chatbot project\\talkshop\\tmp\\git command.txt' },
        // },
      //   includeValues: true,
      includeMetadata: true,
      vector: vector1,
    },
  });
  res.status(200).json({ message: queryResponse });
}
