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
import connectDB from '@/utils/mongoConnection';
import { getSession } from 'next-auth/react';

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
  const { namespaceName, chunkSize, overlapSize } = req.query;

  const openAIapiKey = req.headers['x-openai-key'];
  const pineconeApiKey = req.headers['x-pinecone-key'];
  const targetIndex = req.headers['x-index-name'] as string;
  const pineconeEnvironment = req.headers['x-environment'];

  await connectDB();
  const existingNamespace = await Namespace.findOne({
    name: namespaceName as string,
  });

  if (!existingNamespace) {
    const newNamespace = new Namespace({
      userEmail: userEmail as string,
      name: namespaceName as string,
    });
    await newNamespace.save();
  } else {
    const filesToDelete = fs
      .readdirSync(filePath)
    filesToDelete.forEach((file) => {
      fs.unlinkSync(`${filePath}/${file}`);
    });
    return res.status(400).json({ message : 'There is a same namespace.'})
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
      namespace: namespaceName as string,
      textKey: 'text',
    });

    // Delete the PDF, DOCX and TXT files
    const filesToDelete = fs
      .readdirSync(filePath)
      .filter(
        (file) =>
          file.endsWith('.pdf') ||
          file.endsWith('.docx') ||
          file.endsWith('.txt'),
      );
    filesToDelete.forEach((file) => {
      fs.unlinkSync(`${filePath}/${file}`);
    });

    res.status(200).json({ message: 'Data ingestion complete' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ error: 'Failed to ingest your data' });
  }
}
