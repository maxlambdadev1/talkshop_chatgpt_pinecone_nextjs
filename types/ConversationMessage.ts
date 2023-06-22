import { Document } from 'langchain/document';

export type ConversationMessage = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
  detail : {fileName : string; text:string;}[];
};
