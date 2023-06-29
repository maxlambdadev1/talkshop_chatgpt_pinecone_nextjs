import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect } from 'react';
import UpdatePromptModal from '../other/UpdatePromptModal';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ListOfPrompts = ({
  promptList,
  createPrompt,
  updatePrompt,
  deletePrompt,
}: {
  promptList: any[];
  createPrompt: (title: string) => Promise<any>;
  deletePrompt: (promptId: string) => Promise<any>;
  updatePrompt: (promptId: string, newPrompt: any) => Promise<any>;
}) => {

  const [open, setOpen] = useState<boolean>(false);
  const [selectedPromptIdForDelete, setSelectedPromptIdForDelete] = useState<string>('');
  const [prompt, setPrompt] = useState<any>({});

  const handlePromptClick = (prompt: any, i: number) => {
    console.log('prompt', prompt)
    let prompt1: any = { ...prompt };
    if (prompt.name === 'Prompt') prompt1.name = `Prompt ${i}`;
    setPrompt(prompt1);
    setOpen(true);
  };

  const handleDeletePrompt = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    deletePrompt(promptId);
  };

  return (
    <>
      <ul role="list" className="-mx-2 mt-2 px-2 pb-6 space-y-1">
        {[...promptList].map((prompt, index) => (
          <li
            key={prompt._id}
            className={classNames('text-gray-400 hover:text-white hover:bg-gray-800',
              'group flex justify-between w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold cursor-pointer',
            )}
          >
            <span className='w-full'
              onClick={() => handlePromptClick(prompt, promptList.length - index)}
            >
              {prompt.name === 'Prompt' ? `Prompt ${promptList.length - index}` : prompt.name}
            </span>
            {prompt._id === selectedPromptIdForDelete ? (
              <div className="flex items-center space-x-2">
                <CheckIcon
                  className="h-5 w-5 text-green-400 hover:text-green-500 cursor-pointer"
                  aria-hidden="true"
                  onClick={(e) => handleDeletePrompt(e, selectedPromptIdForDelete)}
                />
                <XMarkIcon
                  className="h-5 w-5 text-gray-400 hover:text-gray-300 cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setSelectedPromptIdForDelete('')}
                />
              </div>
            ) : (
              <div className="">
                <button
                  className="text-red-500 hover:text-red-600 ml-2"
                  onClick={(e) => setSelectedPromptIdForDelete(prompt._id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <UpdatePromptModal
        prompt={prompt}
        updatePrompt={updatePrompt}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
};

export default ListOfPrompts;
