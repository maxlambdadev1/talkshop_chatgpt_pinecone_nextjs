import React, {useState, useEffect} from 'react';
import { PlusCircleIcon, HandRaisedIcon } from '@heroicons/react/20/solid';
import Button from '../buttons/Button';
import ListOfChats from './ListOfChats';
import ListOfNamespaces from './ListOfNamespaces';
import SourceDocumentsToggle from './SourceDocumentsToggle';
import ModelTemperature from './ModelTemperature';
import SelectFilesModal from '@/components/other/SelectFilesModal';

interface SidebarListProps {
  createChat: (title : string) => Promise<string>;
  selectedNamespace: any;
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
  namespaces: any[];
  setSelectedNamespace: React.Dispatch<React.SetStateAction<any>>;
  isLoadingNamespaces: boolean;
  allFiles : string[];
  selectedFiles : string[];
  setSelectedFiles :  React.Dispatch<React.SetStateAction<any>>;
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
  allFiles,
  selectedFiles,
  setSelectedFiles
}) => {
  const [showSelectFilesModal, setShowSelectFilesModal] = useState<boolean>(false);

  return (
    <nav className="flex flex-col h-full">
      <div>
        {!!selectedNamespace?.realName && (
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

        {!!selectedNamespace?.realName && (
          <>
          <div className="flex items-center px-4 mb-2">
            <span
              className="block text-sm font-medium leading-6 text-gray-300"
            >
              Select Files
            </span>
            <HandRaisedIcon
              className="ml-2 h-5 w-5 text-gray-300 hover:text-gray-400 cursor-pointer"
              onClick={() => setShowSelectFilesModal(true)}
            />
          </div>
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
          </>
        )}

        <div className="px-4 text-xs sm:text-sm font-semibold leading-6 text-blue-400">
          Your chats
        </div>
        <div className="px-4 flex-grow overflow-y-auto">
          {!!selectedNamespace?.realName && nameSpaceHasChats ? (
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
              {!!selectedNamespace?.realName
                ? 'No chats in this namespace'
                : 'Select a namespace to display chats'}
            </div>
          )}
        </div>
      </>
      <SelectFilesModal
        open={showSelectFilesModal}
        setOpen={setShowSelectFilesModal}
        allFiles = {allFiles}
        selectedFiles = {selectedFiles}
        setSelectedFiles = {setSelectedFiles}
      />
    </nav>
  );
};

export default SidebarList;
