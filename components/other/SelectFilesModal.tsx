import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allFiles : string[];
  selectedFiles : string[];
  setSelectedFiles :  React.Dispatch<React.SetStateAction<any>>;
};

function SelectFilesModal({ 
  open, setOpen, 
  allFiles,
  selectedFiles,
  setSelectedFiles 
}: Props) {

  const [selectedFiles1, setSelectedFiles1] = useState<string[]>([]);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      setSelectedFiles1(selectedFiles);
    }
  }, [selectedFiles])

  const onchangeFile = (file : string) => {
      console.log('file', file)
    if (selectedFiles1.findIndex(file1 => (file1 === file)) < 0 ) {
      const temp:string[] = selectedFiles1;
      temp.unshift(file);
      setSelectedFiles1([...temp]);
    } else {
      const temp:string[] = selectedFiles1.filter((file1 => (file1 !== file)));
      setSelectedFiles1(temp);
    }
  }

  const onSelectFiles = () => {
    if (selectedFiles1.length > 0 ) {
      setSelectedFiles(selectedFiles1);
      setOpen(false)
    } else {
      alert('You must select the files')
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
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mt-2 text-center sm:mt-4">
                    <Dialog.Title
                      as="h1"
                      className="text-xl font-bold leading-2 pb-2 text-gray-900"
                    >
                      File list
                    </Dialog.Title>
                    <div className="mt-2 ">
                      <ul className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      {allFiles.length > 0 ? selectedFiles.length >= 0 && allFiles.map((file, index) => (
                        <li key = {index} 
                            className="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                          <div className="flex items-center pl-3">
                            <input id={`react-checkbox-${index}`} type="checkbox" value="" 
                              checked={selectedFiles1.findIndex(file1 => (file1 === file)) >= 0}
                              onChange={() => onchangeFile(file)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" />
                              <label htmlFor={`react-checkbox-${index}`} 
                                className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                  {file}
                              </label>
                          </div>
                        </li>
                      )) : (
                        <li>There are no files</li>
                      )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-green-600 px-3 py-2 mr-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    onClick={() => onSelectFiles()}
                  >
                    Select
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

export default SelectFilesModal;
