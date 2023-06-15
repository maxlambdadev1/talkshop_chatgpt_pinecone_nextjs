import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { DocxLoader } from 'langchain/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { initPinecone } from '@/utils/pinecone-client';
import Namespace from '@/models/Namespace';
import SFile from '@/models/SFile';
import connectDB from '@/utils/mongoConnection';
import { getSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

const prefix =
  process.env.NODE_ENV === 'production'
    ? '/tmp/'
    : 'F:\\bs\\dominic\\projects\\doc-chatbot project\\talkshop\\tmp\\';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userEmail = session?.user?.email;
  const { namespace, fileName } = req.query;

  if (!namespace || !fileName || Array.isArray(namespace)) {
    return res
      .status(400)
      .json({ message: 'Please input all data correctly.' });
  }

  const openAIapiKey = process.env.OPENAI_API_KEY;
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const targetIndex = process.env.PINECONE_INDEX_NAME as string;
  const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;

  await connectDB();

  const pinecone = await initPinecone(
    pineconeApiKey as string,
    pineconeEnvironment as string,
  );

  if (!pinecone) {
    return res.status(400).json({ message: 'There is no correct pinecone' });
  }

  try {
    // Load PDF files from the specified directory
    // Get the Pinecone index with the given name
    const index = pinecone.Index(targetIndex);

    const vector1 = [];
    for (let i = 0; i < 1536; i++) {
      vector1.push(0);
    }
    const source = `${prefix}${fileName}`;
    const queryResponse = await index.query({
      queryRequest: {
        namespace,
        topK: 10000,
        filter: {
          source: {
            $eq: source,
          },
        },
        //   includeValues: true,
        // includeMetadata: true,
        vector: vector1,
      },
    });
    const ids: any = queryResponse.matches?.map((item) => item.id);
    let d = 100;
    for (let i = 0; i < ids?.length; i += d) {
      let idList = ids.slice(i, i + d);      
      await index.delete1({ ids : idList, deleteAll : false, namespace : namespace});
    }
    await SFile.deleteMany({ name: fileName, namespace });

    res.status(200).json({ message: ids.slice(0, 0 + d) });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Failed to delete the file' });
  }
}
