import React from 'react';
import { PlusCircleIcon } from '@heroicons/react/20/solid';
import Button from '../buttons/Button';
import ListOfChats from './ListOfChats';
import ListOfNamespaces from './ListOfNamespaces';
import SourceDocumentsToggle from './SourceDocumentsToggle';
import ModelTemperature from './ModelTemperature';

interface SidebarListProps {
  createChat: (title : string) => Promise<string>;
  selectedNamespace: string;
  returnSourceDocuments: boolean;
  setReturnSourceDocuments: React.Dispatch<React.SetStateAction<boolean>>;
  modelTemperature: number;
  setModelTemperature: React.Dispatch<React.SetStateAction<number>>;
  filteredChatList: string[];
  selectedChatId: string;
  setSelectedChatId: React.Dispatch<React.SetStateAction<string>>;
  setConversation: React.Dispatch<React.SetStateAction<any>>;
  nameSpaceHasChats: boolean;
  chatNames: Record<string, string>;
  updateChatName: (chatId: string, newName: string) => void;
  deleteChat: (chatId: string) => void;
  namespaces: string[];
  setSelectedNamespace: React.Dispatch<React.SetStateAction<string>>;
  isLoadingNamespaces: boolean;
}

const SidebarList: React.FC<SidebarListProps> = ({
  selectedNamespace,
  returnSourceDocuments,
  setReturnSourceDocuments,
  modelTemperature,
  setModelTemperature,
  filteredChatList,
  selectedChatId,
  createChat,
  setSelectedChatId,
  setConversation,
  nameSpaceHasChats,
  chatNames,
  updateChatName,
  deleteChat,
  namespaces,
  setSelectedNamespace,
  isLoadingNamespaces,
}) => {
  return (
    <nav className="flex flex-col h-full">
      <div>
        {selectedNamespace && (
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
        )}
      </div>

      <>
        <div className="px-4 w-full space-y-2 mb-6">
          <div className="text-xs sm:text-sm font-semibold leading-6 text-blue-400">
            Your namespaces
          </div>
          <ListOfNamespaces
            isLoadingNamespaces={isLoadingNamespaces}
            namespaces={namespaces}
            selectedNamespace={selectedNamespace}
            setSelectedNamespace={setSelectedNamespace}
          />
        </div>

        {selectedNamespace && (
          <div className="px-4 space-y-3 mb-4">           
            <Button
              buttonType="primary"
              buttonText="New chat"
              onClick={async () => {
                const newChatId = await createChat('Chat');
                setSelectedChatId(newChatId);    
                const initialConversation = {
                  messages: [
                    {
                      message: 'Hi, what would you like to know about these documents?',
                      type: 'apiMessage' as const,
                    },
                  ],
                  history: [],
                };            
                setConversation(initialConversation);
              }}
              icon={PlusCircleIcon}
            />
          </div>
        )}

        <div className="px-4 text-xs sm:text-sm font-semibold leading-6 text-blue-400">
          Your chats
        </div>
        <div className="px-4 flex-grow overflow-y-auto">
          {selectedNamespace && nameSpaceHasChats ? (
            <ListOfChats
              filteredChatList={filteredChatList}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              chatNames={chatNames}
              updateChatName={updateChatName}
              deleteChat={deleteChat}
            />
          ) : (
            <div className="text-xs font-semibold leading-6 text-red-400">
              {selectedNamespace
                ? 'No chats in this namespace'
                : 'Select a namespace to display chats'}
            </div>
          )}
        </div>
      </>
    </nav>
  );
};

export default SidebarList;
