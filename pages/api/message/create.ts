import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { initPinecone } from '@/utils/pinecone-client';
import { SourceDoc } from '@/types';
import connectDB from '@/utils/mongoConnection';
import Message from '@/models/Message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {
    question,
    history,
    chatId,
    selectedNamespace,
    returnSourceDocuments,
    modelTemperature,
    userEmail,
  } = req.body;

  const openAIapiKey = process.env.OPENAI_API_KEY;
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;
  const targetIndex = process.env.PINECONE_INDEX_NAME as string;

  const pinecone = await initPinecone(
    pineconeApiKey as string,
    pineconeEnvironment as string,
  );

  if (!openAIapiKey) {
    return res.status(500).json({ error: 'OpenAI API key not set' });
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  if (!pinecone) {
    return res.status(400).json({ message: 'There is no correct pinecone' });
  }

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  try {    
    const index = pinecone.Index(targetIndex as string);

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: openAIapiKey as string,
      }),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: selectedNamespace,
      },
    );

    const chain = makeChain(
      vectorStore,
      returnSourceDocuments,
      modelTemperature,
      openAIapiKey as string,
    );
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    });
    
    const userMessage = new Message({
      sender: 'user',
      content: sanitizedQuestion,
      chatId: chatId,
      namespace: selectedNamespace,
      userEmail: userEmail,
    });
    await userMessage.save();

    const botMessage = new Message({
      sender: 'bot',
      content: response.text.toString(),
      chatId: chatId,
      namespace: selectedNamespace,
      userEmail: userEmail,
      sourceDocs: response.sourceDocuments
        ? response.sourceDocuments.map((doc: SourceDoc) => ({
            pageContent: doc.pageContent,
            metadata: { source: doc.metadata.source },
          }))
        : [],
    });
    await botMessage.save();

    res
      .status(200)
      .json({ text: response.text, sourceDocuments: response.sourceDocuments });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
