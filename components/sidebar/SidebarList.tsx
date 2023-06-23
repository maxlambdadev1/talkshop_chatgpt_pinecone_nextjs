import React, {useState, useEffect} from 'react';
import { PlusCircleIcon, HandRaisedIcon } from '@heroicons/react/20/solid';
import Button from '../buttons/Button';
import ListOfChats from './ListOfChats';
import SourceDocumentsToggle from './SourceDocumentsToggle';
import ModelTemperature from './ModelTemperature';
import SelectFilesModal from '@/components/other/SelectFilesModal';

interface SidebarListProps {
  createChat: (title : string) => Promise<any>;
  returnSourceDocuments: boolean;
  setReturnSourceDocuments: React.Dispatch<React.SetStateAction<boolean>>;
  modelTemperature: number;
  setModelTemperature: React.Dispatch<React.SetStateAction<number>>;
  chatList: any[];
  selectedChatId: string;
  setSelectedChatId: React.Dispatch<React.SetStateAction<string>>;
  setConversation: React.Dispatch<React.SetStateAction<any>>;
  nameSpaceHasChats: boolean;
  chatNames: Record<string, string>;
  updateChatName: (chatId: string, newName: string) => void;
  deleteChat: (chatId: string) => void;
  namespaces: any[];
  isLoadingNamespaces: boolean;
}

const SidebarList: React.FC<SidebarListProps> = ({
  returnSourceDocuments,
  setReturnSourceDocuments,
  modelTemperature,
  setModelTemperature,
  chatList,
  selectedChatId,
  createChat,
  setSelectedChatId,
  setConversation,
  nameSpaceHasChats,
  chatNames,
  updateChatName,
  deleteChat,
  namespaces,
  isLoadingNamespaces,
}) => {

  return (
    <nav className="flex flex-col h-full">
      <div>
          <div className="px-4 space-y-3 mb-4">
            <SourceDocumentsToggle
              checked={returnSourceDocuments}
              setReturnSourceDocuments={setReturnSourceDocuments}
            />

            <ModelTemperature
              modelTemperature={modelTemperature}
              setModelTemperature={setModelTemperature}
            />
          </div>
      </div>

      <>
          <div className="px-4 space-y-3 mb-4">           
            <Button
              buttonType="primary"
              buttonText="New chat"
              onClick={async () => {
                const newChat:any = await createChat('Chat');
                setSelectedChatId(newChat._id);    
                const initialConversation = {
                  messages: [
                    {
                      message: 'Hi, what would you like to know about these documents?',
                      type: 'apiMessage' as const,
                    },
                  ],
                };            
                setConversation(initialConversation);
              }}
              icon={PlusCircleIcon}
            />
          </div>

        <div className="px-4 text-xs sm:text-sm font-semibold leading-6 text-blue-400">
          Your chats
        </div>
        <div className="px-4 flex-grow overflow-y-auto">
          {nameSpaceHasChats ? (
            <ListOfChats
              chatList={chatList}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              chatNames={chatNames}
              updateChatName={updateChatName}
              deleteChat={deleteChat}
            />
          ) : (
            <div className="text-xs font-semibold leading-6 text-red-400">
              There are no chats.
            </div>
          )}
        </div>
      </>
    </nav>
  );
};

export default SidebarList;
