import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDropzone } from 'react-dropzone';
import { TrashIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  prompt: any;
  updatePrompt: (newPrompt: any, image: any) => Promise<any>;
  deleteImageFromPrompt: (promptId : string) => Promise<any>;
};
const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB in bytes

function UpdatePromptModal({ open, setOpen, prompt, updatePrompt, deleteImageFromPrompt }: Props) {
  const [promptId, setPromptId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');
  const [image, setImage] = useState<string>('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    if (!!prompt) {
      setName(prompt.name);
      setDescription(prompt.description);
      setPromptText(prompt.prompt);
      setPromptId(prompt._id);
      if (prompt.image) setImage(`/images/${prompt?.image}`);
      else setImage('')
    }
  }, [prompt]);


  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: (selectedFiles: File[]) => {
      let totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
      if (totalSize > MAX_FILE_SIZE) {
        setSelectedFiles([]);
        setUploadError('Please select the files less than 4.5MB totally.')
      } else {
        setSelectedFiles(selectedFiles);
        setUploadError('')
      }
    },
    multiple: false,
    accept: {
      mimetypes: [
        'image/png', 'image/gif', 'image/bmp', 'image/jpeg', 'image/webp'
      ],
      extensions: ['png', 'gif', 'bmp', 'jpeg', 'jpg', 'webp'],
    },
    maxFiles: 10,
  });

  useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
    }
  }, [open])

  const onUpdatePrompt = async () => {
    if (!!promptId && !!name) {
      const newPrompt: any = {};
      newPrompt.promptId = promptId;
      newPrompt.name = name;
      newPrompt.description = description;
      newPrompt.prompt = promptText;
      let image1 = image;
      newPrompt.image = image1.replace('/images/', '');
      const file = selectedFiles.length > 0 ? selectedFiles[0] : null;
      try {
        console.log('updatePrompt', newPrompt, file);
        await updatePrompt(newPrompt, file);
        setOpen(false);
      } catch (err) {
        console.log('error', err);
      }
    }
  }

  const onDeleteImageFromPrompt = async () => {
    if (!!promptId) {
      await deleteImageFromPrompt(promptId);
      setImage('');
    }
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-100 dark:bg-gray-800 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg dark:border-white border rounded-md bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className='text-gray-600 dark:text-white '>
                  <div className="mt-2 sm:mt-3">
                    <label htmlFor='name' className='text-lg font-semibold'>Name : </label>
                    <input type='text' name='name' id='name'
                      className='w-full rounded-lg   dark:bg-gray-900/80'
                      value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <label htmlFor='description' className='text-lg font-semibold'>Description : </label>
                    <textarea name='description' id='description'
                      className='w-full rounded-lg    dark:bg-gray-900/80'
                      placeholder='A description for your prompt'
                      value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <label htmlFor='prompt' className='text-lg font-semibold'>Prompt : </label>
                    <textarea name='prompt' id='prompt'
                      className='w-full rounded-lg  dark:bg-gray-900/80'
                      placeholder='Prompt content. Use {{}} to denote a variable. Ex: {{name}} is a {{adjective}} {{noun}}'
                      value={promptText} onChange={(e) => setPromptText(e.target.value)} />
                  </div>
                  {!!image ? (
                    <div className='flex justify-between mt-4'>
                      <img src={image} alt='prompt image' className='max-h-24 w-5/6' />
                      <button
                        className="text-red-500 hover:text-red-600 ml-2"
                        onClick={() => onDeleteImageFromPrompt()}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="mt-4 sm:mt-8 flex justify-center"
                        {...getRootProps()}
                      >
                        {' '}
                        <label className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-1 sm:p-2 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer">
                          {' '}
                          <svg
                            className="mx-auto h-6 sm:h-8 w-6 sm:w-8 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
                            />
                          </svg>
                          <input
                            {...getInputProps({
                              onClick: (event) => event.stopPropagation(),
                            })}
                          />
                          <span className="mt-2 sm:mt-2 block text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-100">
                            {selectedFiles.length > 0
                              ? selectedFiles.map((file, index) => <p key={index}>{file.name}</p>)
                              : 'Drag and drop or click to select Image to upload'}
                          </span>
                        </label>
                      </div>
                      {/* upload area */}
                      {!!uploadError && (
                        <div className="mt-4 sm:mt-8 flex justify-center mb-4">
                          <div className="text-red-500 text-sm sm:text-base font-semibold">
                            {uploadError}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-5 sm:mt-6 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-green-600 px-3 py-2 mr-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    onClick={onUpdatePrompt}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default UpdatePromptModal;
