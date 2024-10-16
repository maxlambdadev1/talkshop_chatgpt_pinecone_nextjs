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
  const { namespace, chunkSize, overlapSize } = req.query;

  const filesToDelete = fs
    .readdirSync(filePath)
    .filter(
      (file) =>
        file.endsWith('.pdf') ||
        file.endsWith('.docx') ||
        file.endsWith('.txt'),
    );
  if (filesToDelete.length <= 0) {
    return res
      .status(400)
      .json({ message: 'There are no any files for embedding to pinecone.' });
  }

  const openAIapiKey = process.env.OPENAI_API_KEY;
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const targetIndex = process.env.PINECONE_INDEX_NAME as string;
  const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;

  await connectDB();
  const existingNamespace = await Namespace.findOne({
    realName: namespace as string,
    userEmail: userEmail as string,
  });

  if (!existingNamespace) {
    return res.status(400).json({ message: 'The namespace does not exist.' });
  }

  const pinecone = await initPinecone(
    pineconeApiKey as string,
    pineconeEnvironment as string,
  );

  if (!pinecone) {
    return res.status(400).json({ message: 'There is no correct pinecone' });
  }

  try {
    // Load PDF files from the specified directory
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
      '.docx': (path) => new DocxLoader(path),
      '.txt': (path) => new TextLoader(path),
    });

    const rawDocs = await directoryLoader.load();

    // Split the PDF documents into smaller chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: Number(chunkSize),
      chunkOverlap: Number(overlapSize),
    });

    const docs = await textSplitter.splitDocuments(rawDocs);

    // OpenAI embeddings for the document chunks
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openAIapiKey as string,
    });

    // Get the Pinecone index with the given name
    const index = pinecone.Index(targetIndex);

    // Store the document chunks in Pinecone with their embeddings
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: namespace as string,
      textKey: 'text',
    });

    // Delete the PDF, DOCX and TXT files
    filesToDelete.forEach(async (file) => {
      let path = `${filePath}/${file}`;
      let size = fs.statSync(path).size;

      const existingFile = await SFile.findOne({
        name: file,
        namespace: namespace,
      });
      if (!existingFile) {
        const newFile = new SFile({
          name: file,
          size: size,
          namespace: namespace,
        });
        await newFile.save();
      }
      fs.unlinkSync(path);
    });

    res.status(200).json({ message: 'Added files successfully' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Failed to ingest your data' });
  }
}
