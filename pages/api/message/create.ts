import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { initPinecone } from '@/utils/pinecone-client';
import { SourceDoc } from '@/types';
import connectDB from '@/utils/mongoConnection';
import Message from '@/models/Message';
import SFile from '@/models/SFile';
import Namespace from '@/models/Namespace';
import { PromptTemplate } from 'langchain/prompts';

const prefixProd = '/tmp/';
const prefixDev =
  'F:\\bs\\dominic\\projects\\doc-chatbot project\\talkshop\\tmp\\';

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

    let filesInfo = await SFile.find({
      namespace: selectedNamespace,
    });
    let filenames = filesInfo.map((item: any) => item.name);

    const response1 = [];
    for (let i = 0; i < filenames.length; i++) {
      let fileName = filenames[i];

      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({
          openAIApiKey: openAIapiKey as string,
        }),
        {
          pineconeIndex: index,
          textKey: 'text',
          namespace: selectedNamespace,
          filter : {
            source: {
              $in: [`${prefixProd}${fileName}`, `${prefixDev}${fileName}`],
            },
          }
        },
      );

      // Provide your response in markdown format.`;
      let qa_prompt = `You are an intelligent AI assistant designed to interpret and answer questions and instructions based on specific provided documents. The context from these documents has been processed and made accessible to you. 
  
  Your mission is to generate answers that are accurate, succinct, and comprehensive, drawing upon the information contained in the context of the documents. If the answer isn't readily found in the documents, you should make use of your training data and understood context to infer and provide the most plausible response.
  
  You are also capable of evaluating, comparing and providing opinions based on the content of these documents. Hence, if asked to compare or analyze the documents, use your AI understanding to deliver an insightful response.
  
  Here is the context from the documents:
  
  Context: {context}
  
  Here is the user's question:
  
  Question: {question}
  
  This is the fileName that contain the documents : ${fileName}
  Ignore the chat history content about other file's content. Only use the chat history for the file.

  Provide your response as following styles finally : 
  In ${fileName}, ...
  
  Provide your response in markdown format.`;
  
      const chain = makeChain(
        vectorStore,
        returnSourceDocuments,
        modelTemperature,
        openAIapiKey as string,
        qa_prompt,
      );
      response1[i] = chain.call({
        question: sanitizedQuestion,
        chat_history: history || [],
        fileName: fileName,
      });
    }
    const response = await Promise.all([...response1]);
    const text = response.map(item => item.text).reduce((total, item) => total + '\n\r' + item )

    // await connectDB();
    // const userMessage = new Message({
    //   sender: 'user',
    //   content: sanitizedQuestion,
    //   chatId: chatId,
    //   namespace: selectedNamespace,
    //   userEmail: userEmail,
    // });
    // await userMessage.save();

    // const botMessage = new Message({
    //   sender: 'bot',
    //   content: response.text.toString(),
    //   chatId: chatId,
    //   namespace: selectedNamespace,
    //   userEmail: userEmail,
    //   sourceDocs: response.sourceDocuments
    //     ? response.sourceDocuments.map((doc: SourceDoc) => ({
    //         pageContent: doc.pageContent,
    //         metadata: { source: doc.metadata.source },
    //       }))
    //     : [],
    // });
    // await botMessage.save();

    // res
    //   .status(200)
    //   .json({ text: response.text, sourceDocuments: response.sourceDocuments });

    res.status(200).json({text : text, sourceDocuments : []})
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
