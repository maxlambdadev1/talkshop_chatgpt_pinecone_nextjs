import React, {useState, useEffect} from 'react';
import { PlusCircleIcon, HandRaisedIcon } from '@heroicons/react/20/solid';
import Button from '../buttons/Button';
import ListOfPrompts from './ListOfPrompts';
import SourceDocumentsToggle from './SourceDocumentsToggle';
import ModelTemperature from './ModelTemperature';
import SelectFilesModal from '@/components/other/SelectFilesModal';

interface SidebarRightListProps {
  createPrompt: (title : string) => Promise<any>;
  deletePrompt: (promptId : string) => Promise<any>;
  updatePrompt: (promptId: string, newPrompt: any) => Promise<any>;
  promptList: any[];
  // returnSourceDocuments: boolean;
  // setReturnSourceDocuments: React.Dispatch<React.SetStateAction<boolean>>;
  // modelTemperature: number;
  // setModelTemperature: React.Dispatch<React.SetStateAction<number>>;
  // selectedChatId: string;
  // setSelectedChatId: React.Dispatch<React.SetStateAction<string>>;
  // setConversation: React.Dispatch<React.SetStateAction<any>>;
  // nameSpaceHasChats: boolean;
  // chatNames: Record<string, string>;
  // deleteChat: (chatId: string) => void;
  namespaces: any[];
  isLoadingNamespaces: boolean;
}

const SidebarRightList: React.FC<SidebarRightListProps> = ({
  // returnSourceDocuments,
  // setReturnSourceDocuments,
  // modelTemperature,
  // setModelTemperature,
  // chatList,
  // selectedChatId,
  createPrompt,
  deletePrompt,
  updatePrompt,
  promptList,
  // setSelectedChatId,
  // setConversation,
  // nameSpaceHasChats,
  // deleteChat,
  namespaces,
  isLoadingNamespaces,
}) => {

  return (
    <nav className="flex flex-col h-full pt-20"
    >
      <>
          <div className="px-4 sm:px-0 space-y-3 mb-4">           
            <Button
              buttonType="primary"
              buttonText="New Prompt"
              onClick={() => createPrompt('Prompt')}
              icon={PlusCircleIcon}
            />
          </div>

        <div className="px-4 sm:px-0 text-xs sm:text-sm font-semibold leading-6 text-blue-400">
          
        </div>
        <div className="px-4 sm:px-0 flex-grow overflow-y-auto">
          {promptList.length > 0 ? (
            <ListOfPrompts
              promptList={promptList}
              createPrompt={createPrompt}
              updatePrompt={updatePrompt}
              deletePrompt={deletePrompt}
            />
          ) : (
            <div className="text-xs font-semibold leading-6 text-red-400">
              There are no prompts.
            </div>
          )}
        </div>
      </>
    </nav>
  );
};

export default SidebarRightList;
