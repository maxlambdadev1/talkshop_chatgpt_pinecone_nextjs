import React, {useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/other/LoadingDots';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/other/Accordion';
import remarkGfm from 'remark-gfm';
// import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw'
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  promptList : any[];
  // messageListRef: React.RefObject<HTMLDivElement>;
}

function MessageList({ messages, loading,  promptList }: MessageListProps) {

  const replacePromptToHighlight = (index : number) => {
    let message =  messages[index];
    let prompt:any;
    if (message.type === 'userMessage') {
      let text = message.message;
      prompt = promptList.find((prompt) => {
        return (prompt.name === text)
      });
    } else { //apiMessage
      if (index > 0 && index < messages.length) {
        let prevUserMessage = messages[index - 1];
        let text = prevUserMessage.message;
        prompt = promptList.find((prompt) => {
          return (prompt.name === text)
        });
      }
    }
    // console.log(`prompt${index}`, prompt)
    if (!!prompt) {
      let str:string = prompt.prompt;

      const startDelimiter = '{{';
      const endDelimiter = '}}';
      let startIndex = 0;
      let highlightItems:string[] = [];
      while (startIndex !== -1) {
        startIndex = str.indexOf(startDelimiter, startIndex);
        if (startIndex !== -1) {
          const endIndex = str.indexOf(endDelimiter, startIndex);
          const extractedText = str.substring(startIndex + startDelimiter.length, endIndex).trim();
          highlightItems.push(extractedText);
          startIndex = endIndex + endDelimiter.length;
        }
      }
      // console.log('highlightItems ', highlightItems)
      let message1 = message.message;
      highlightItems.forEach(item => {
        if (!!item) {
          let replacement = Math.floor((index - 1)%4 / 2) === 0 ? `<span class='bg-purple-600'>${item}</span>` : `<span class='bg-blue-600'>${item}</span>`
          message1 = message1.replaceAll(item, replacement);
        }
      })
      let image = '';
      if (!!prompt && !!prompt.image && message.type === 'apiMessage') image = prompt.image;
      return {message : message1, image};
    } else return {message : message.message, image : ''}
  } 

  return (
    <>
      <div className="overflow-y-auto">
        <div >
          {messages.map((message, index) => {
            const isApiMessage = message.type === 'apiMessage';
            const messageClasses = ` ${
              isApiMessage ? 'dark:bg-gray-700/50' : 'bg-gray-100 dark:bg-gray-800'
            }`;
            const replacedMessage = replacePromptToHighlight(index);
            return (
              <div key={`chatMessage-${index}`} className={messageClasses}>
                <div className="flex items-center justify-start max-w-full sm:max-w-4xl  mx-auto overflow-hidden px-2 sm:px-4">
                  <div className="flex flex-col w-full">
                    <div className="w-full text-gray-900 dark:text-gray-300 p-2 sm:p-4 overflow-wrap break-words">
                      <span
                        className={`mt-2 inline-flex items-center rounded-md px-2 py-1 text-xs sm:text-sm font-medium ring-1 ring-inset ${
                          isApiMessage
                            ? 'bg-indigo-400/10 text-indigo-400 ring-indigo-400/30'
                            : 'bg-purple-400/10 text-purple-400 ring-purple-400/30'
                        }`}
                      >
                        {isApiMessage ? 'AI' : 'YOU'}
                      </span>
                      <div className="mx-auto max-w-full">
                        <ReactMarkdown
                          linkTarget="_blank"
                          className="markdown text-xs sm:text-sm md:text-base leading-relaxed"
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          // rehypePlugins={[rehypeKatex]}
                        >
                          {replacedMessage.message}
                        </ReactMarkdown>
                      </div>
                    </div>
                    { !!replacedMessage.image && (
                      <div className='px-4 py-2 flex justify-center'>
                        <img src={`/images/${replacedMessage.image}`} alt='prompt image' className='max-h-24 max-w-md' />
                      </div>
                    )}
                    {message.sourceDocs && (
                      <div
                        className="mt-4 mx-2 sm:mx-4"
                        key={`sourceDocsAccordion-${index}`}
                      >
                        <Accordion
                          type="single"
                          collapsible
                          className="flex flex-col"
                        >
                          {message.sourceDocs.map((doc, docIndex) => (
                            <div
                              key={`messageSourceDocs-${docIndex}`}
                              className="mb-6 px-4 py-0 sm:py-1 bg-gray-700 rounded-lg shadow-md"
                            >
                              <AccordionItem value={`item-${docIndex}`}>
                                <AccordionTrigger>
                                  <h3 className="text-xs sm:text-sm md:text-base text-white">
                                    Source {docIndex + 1}
                                  </h3>
                                </AccordionTrigger>
                                <AccordionContent className="mt-2 overflow-wrap break-words">
                                  <ReactMarkdown
                                    linkTarget="_blank"
                                    className="markdown text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed"
                                    remarkPlugins={[remarkGfm]}
                                  >
                                    {doc.pageContent.replace(
                                      /(?<=\S)\n/g,
                                      '  \n',
                                    )}
                                  </ReactMarkdown>
                                </AccordionContent>
                              </AccordionItem>
                            </div>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-32 w-full dark:bg-gray-700/50">
          <div className="flex-shrink-0 p-1">
            <LoadingDots color="#04d9ff" />
          </div>
        </div>
      )}
    </>
  );
}

export default MessageList;
