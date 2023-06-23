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
import { getSession } from 'next-auth/react';
import { PromptTemplate } from 'langchain/prompts';

const prefixProd = '/tmp/';
const prefixDev =
  'F:\\bs\\dominic\\projects\\doc-chatbot project\\talkshop\\tmp\\';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // const session = await getSession({ req });
  // if (!session) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }
  // const userEmail = session?.user?.email;

  const {
    question,
    chatId,
    selectedNamespaces,
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

  if (selectedNamespaces.length <= 0) {
    return res.status(400).json({ message: 'Please include the namespaces' });
  }

  if (!pinecone) {
    return res.status(400).json({ message: 'There is no correct pinecone' });
  }

  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');
  try {
    const index = pinecone.Index(targetIndex as string);

    const response1 = [];
    for (let i = 0; i < selectedNamespaces.length; i++) {
      let namespace = selectedNamespaces[i];

      const messages = await Message.find({
        chatId
      });
      const pairedMessages = [];
      for (let i = 0; i < messages.length; i += 2) {
        pairedMessages.push([messages[i], messages[i + 1]]); //[user, bot]
      }

      const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({
          openAIApiKey: openAIapiKey as string,
        }),
        {
          pineconeIndex: index,
          textKey: 'text',
          namespace: namespace.realName,
        },
      );

      // Provide your response in markdown format.`;
      let qa_prompt = `You are an intelligent AI assistant designed to interpret and answer questions and instructions based on specific provided documents. The context from these documents has been processed fully and made accessible to you. 
  
      Your mission is to generate answers that are accurate and comprehensive, drawing upon the information contained in the context of the documents. 
    You have to analyze all context and get the correct answer using AI.
    If the answer isn't readily found in the documents, you should make use of your training data and understood context to infer and provide the most plausible response.
      
      You are also capable of evaluating, comparing and providing opinions based on the content of these documents. Hence, if asked to compare or analyze the documents, use your AI understanding to deliver an insightful response.
      
      Here is the context from the documents:
      
      Context: {context}
      
  Here is the user's question:
  
  Question: {question}
  
  This is the namespace that contain the documents : ${namespace.name}

  Provide your response as following styles finally in markdown format : 
  In ${namespace.name} (display the namespace as big font) :  
  ...
  
  Provide your response in markdown format.`;

      const history =
        pairedMessages.length > 0
          ? pairedMessages.map((item) => {
              let botAns = item[1].detail.filter(
                (item1) => item1.namespace === namespace.realName,
              );
              let botText = '';
              if (botAns.length > 0) {
                botText = botAns[0].text;
              }
              return [
                item[0].content, //user
                botText,
              ];
            })
          : [];

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
      });
    }
    const response = await Promise.all([...response1]);
    const text = response
      .map((item) => item.text)
      .reduce((total, item) => total + '\n\r' + item);
    const sourceDocs = returnSourceDocuments
      ? response
          .map((item) => {
            return !!item.sourceDocuments ? item.sourceDocuments : [];
          })
          .reduce((total, item) => total.concat(item))
      : [];
    const detail = response.map((item, index) => ({
      namespace: selectedNamespaces[index].realName,
      text: item.text,
    }));

    await connectDB();
    const userMessage = new Message({
      sender: 'user',
      content: sanitizedQuestion,
      chatId: chatId,
      namespaces: selectedNamespaces,
      userEmail: userEmail,
    });
    await userMessage.save();

    const botMessage = new Message({
      sender: 'bot',
      content: text.toString(),
      chatId: chatId,
      namespaces: selectedNamespaces,
      userEmail: userEmail,
      sourceDocs: sourceDocs,
      detail: detail,
    });
    await botMessage.save();

    res
      .status(200)
      .json({ text: text, sourceDocuments: sourceDocs, detail: detail });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
