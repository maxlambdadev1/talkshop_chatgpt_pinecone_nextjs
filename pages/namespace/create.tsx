import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import ChunkSizeModal from '@/components/other/ChunkSizeModal';
import { setItem } from '@/libs/localStorageKeys';
import OverlapSizeModal from '@/components/other/OverlapSizeModal';
import {
  ArrowRightIcon,
  PencilIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import Pattern from './components/Pattern';
import { useLocalStorage } from '@/libs/localStorage';
import { useSession } from 'next-auth/react';

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB in bytes

export default function Create() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const [namespaceName, setNamespaceName] = useState<string>('');
  const [deleteMessage, setDeleteMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [error, setError] = useState<{ message: string; customString: string }>(
    {
      message: '',
      customString: '',
    },
  );
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [ingestError, setIngestError] = useState<string>('');
  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [chunkSize, setChunkSize] = useState<number>(1200);
  const [overlapSize, setOverlapSize] = useState<number>(20);
  const [selectedNamespace, setSelectedNamespace] = useState<any>('');
  const [showChunkSizeModal, setShowChunkSizeModal] = useState<boolean>(false);
  const [showOverlapSizeModal, setShowOverlapSizeModal] =
    useState<boolean>(false);
  const router = useRouter();
  const [userInfo, setUserInfo] = useLocalStorage<any>('userInfo', {});

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => router.push('/login'),
  });

  useEffect(() => {
    if (!!userInfo) {
      if (userInfo.role !== 'admin') router.push('/');
    }
  }, [userInfo, router])

  const fetchNamespaces = useCallback(async () => {
    try {
      const response = await fetch(`/api/getNamespaces`);
      const data = await response.json();

      if (response.ok) {
        setNamespaces(data);
        setError({
          customString: '',
          message: '',
        });
      } else {
        setError(data.error);
      }
    } catch (error: any) {
      setError({
        message: error.message,
        customString: 'An error occured while fetching namespaces',
      });
    }
  }, []);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  const handleDelete = async (namespace: any) => {
    try {
      const response = await fetch(
        `/api/deleteNamespace?namespace=${namespace.realName}`,
        {
          method: 'DELETE'
        },
      );

      if (response.ok) {
        const updatedNamespaces = namespaces.filter(
          (item) => item.realName !== namespace.realName,
        );
        setNamespaces(updatedNamespaces);
        setDeleteMessage(`${namespace.name} has been successfully deleted.`);
        setTimeout(() => setDeleteMessage(''), 3000);
      } else {
        const data = await response.json();
        console.log(data.error);
      }
    } catch (error: any) {
      console.log(error);
      setError({
        message: error.message,
        customString: 'An error occured trying to delete a namespace',
      });
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
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
      setMessage('Ingest')
      setUploadMessage('Upload files')
    },
    multiple: true,
    accept: {
      mimetypes: [
        'application/pdf',
        // 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      extensions: ['pdf', 'docx', 'txt'],
    },
    maxFiles: 20,
  });

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      // formData.append(`file${i}`, selectedFiles[i]);
      formData.append(`files`, selectedFiles[i]);
    }

    try {
      setUploadMessage('Uploading...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const resData = await response.json();
        setUploadedFiles(resData.data);
        setUploadMessage('Uploaded');
        setIsUploaded(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
        setUploadMessage('Upload files');
      }
    } catch (error: any) {
      setError({
        message: error.message,
        customString: 'An error occured trying to upload files',
      });
    }
  };

  const handleIngest = async () => {
    try {
      setLoading(true);
      setIngestError('');

      const response = await fetch(
        `/api/consume?namespaceName=${namespaceName}&chunkSize=${chunkSize}&overlapSize=${overlapSize}`,
        {
          method: 'POST'
        },
      );

      if (response.ok) {
        const data = await response.json();
        // setMessage('Data ingestion complete');
        setMessage('Ingest');
        fetchNamespaces();
        setIngestError('');
        setUploadedFiles([]);
        setIsUploaded(false);
        setUploadMessage('Upload files');
        setSelectedFiles([]);
      } else {
        const errorData = await response.json();
        setIngestError(errorData.message);
      }
    } catch (error: any) {
      setIngestError('Server error');
    }
    setLoading(false);
  };

  return (
    <div className="relative isolate min-h-screen dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="relative px-6 pb-12 pt-12 sm:pt-32 lg:static lg:px-8 lg:py-20 ">
          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
            <Pattern />
            {!!error && !!error.customString && (
              <div className="mt-4 sm:mt-8 flex justify-center mb-4">
                <div className="text-red-500 text-sm sm:text-base font-semibold">
                  {error.customString}
                </div>
              </div>
            )}
            <div className="max-w-xl mx-auto">

              <div className="flex justify-between items-center space-x-2 align-center mb-2">
                {namespaces.length > 0 ? (
                  <h2 className="mb-4 text-xl text-center sm:text-3xl sm:text-left font-bold text-gray-800 dark:text-white">
                    Your namespaces
                  </h2>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-red-400/10 px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-400 ring-1 ring-inset ring-red-400/20">
                    No namespaces found
                  </span>
                )}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 '>
                  {namespaces && namespaces.length > 0 ? (
                    <button
                      type="button"
                      className="rounded-md items-center align-center justify-between flex bg-blue-600 hover:bg-blue-500  px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300"
                      onClick={() => router.push('/namespace/update')}
                    >
                      Update
                      <PencilIcon className="ml-2 -mr-0.5 h-4 w-4" />
                    </button>
                  ) : <div></div>}
                  <button
                    type="button"
                    className="rounded-md items-center align-center justify-between flex bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200"
                    onClick={() => router.push('/')}
                  >
                    Chatting
                    <ArrowRightIcon
                      className="ml-2 -mr-0.5 h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>

                </div>
              </div>

              <ul role="list" className="grid grid-cols-2 gap-4 py-2">
                {namespaces.map((namespace) => (
                  <li
                    key={namespace.realName}
                    className="bg-gray-200 dark:bg-gray-800/60 rounded-lg shadow px-5 py-4 flex items-center justify-between space-x-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-600 dark:text-white truncate">
                        {namespace.name}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {selectedNamespace.realName === namespace.realName ? (
                        <div className="flex items-center space-x-2">
                          <CheckIcon
                            className="h-5 w-5 text-green-400 hover:text-green-500 cursor-pointer"
                            aria-hidden="true"
                            onClick={() => handleDelete(selectedNamespace)}
                          />
                          <XMarkIcon
                            className="h-5 w-5 text-gray-400 hover:text-gray-300 cursor-pointer"
                            aria-hidden="true"
                            onClick={() => setSelectedNamespace({})}
                          />
                        </div>
                      ) : (
                        <TrashIcon
                          className="h-5 w-5 text-red-400
                        hover:text-red-500 cursor-pointer
                        "
                          aria-hidden="true"
                          onClick={() => setSelectedNamespace(namespace)}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {deleteMessage && (
                <p className="mt-6 text-md font-medium text-green-400 text-center">
                  {deleteMessage}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* ------------------------------- */}
        <div className="px-6 pb-24 pt-12 sm:pb-32 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg ">
            {/* upload area */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {' '}
              Creating namespaces
            </h2>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg leading-6 sm:leading-8 text-gray-600 dark:text-gray-300">
              {' '}
              Treat namespaces like topics of conversation. You can create as
              many as you like, and they can be used to organize your data.
            </p>

            <div
              className="mt-4 sm:mt-8 flex justify-center"
              {...getRootProps()}
            >
              {' '}
              <label className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 sm:p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer">
                {' '}
                <svg
                  className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-400"
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
                    : 'Drag and drop or click to select files to upload'}
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
            <div className="mt-4 sm:mt-8 flex justify-end">
              <button
                className="rounded-md bg-indigo-500 px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-center text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={handleUpload}
              >
                {uploadMessage ? uploadMessage : 'Upload files'}
              </button>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 sm:mt-4'>
              <div >
                <div className="flex items-center">
                  <label
                    htmlFor="chunkSize"
                    className="block text-sm font-medium leading-6 text-gray-600 dark:text-gray-300"
                  >
                    Chunk size
                  </label>
                  <QuestionMarkCircleIcon
                    className="ml-2 h-5 w-5 text-gray-300 hover:text-gray-400 cursor-pointer"
                    onClick={() => setShowChunkSizeModal(true)}
                  />
                </div>

                <div className="w-full">
                  <input
                    type="range"
                    min={100}
                    max={4000}
                    step={100}
                    id='chunkSize'
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Number(e.target.value))}
                    className="w-full"
                  />

                  <div className="text-center  text-gray-600 dark:text-gray-100">{chunkSize}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <label
                    htmlFor="overlapSize"
                    className="block text-sm font-medium leading-6 text-gray-600 dark:text-gray-300"
                  >
                    Overlap size
                  </label>
                  <QuestionMarkCircleIcon
                    className="ml-2 h-5 w-5 text-gray-300 cursor-pointer hover:text-gray-400"
                    onClick={() => setShowOverlapSizeModal(true)}
                  />
                </div>

                <div className="w-full">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={5}
                    value={overlapSize}
                    onChange={(e) => setOverlapSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-gray-600 dark:text-gray-100">{overlapSize}%</div>
                </div>
              </div>
            </div>

            <ChunkSizeModal
              open={showChunkSizeModal}
              setOpen={setShowChunkSizeModal}
            />
            <OverlapSizeModal
              open={showOverlapSizeModal}
              setOpen={setShowOverlapSizeModal}
            />

            {isUploaded && (
              <div className="mt-2 sm:mt-4 grid grid-cols-1 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold leading-6 text-gray-600 dark:text-white"
                  >
                    Namespace name
                  </label>

                  <div className="mt-2.5">
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 bg-white/5 px-2 sm:px-3.5 py-1.5 sm:py-2  text-gray-600 dark:text-white shadow-sm ring-1 ring-inset dark:ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-sm sm:text-base sm:leading-6 opacity-50"
                      value={namespaceName}
                      onChange={(e) => setNamespaceName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            {isUploaded && !!ingestError && (
              <div className="mt-4 sm:mt-8 flex justify-center mb-4">
                <div className="text-red-500 text-sm sm:text-base font-semibold">
                  {ingestError}
                </div>
              </div>
            )}
            {isUploaded && namespaceName && (
              <div className="mt-2 sm:mt-4 flex justify-end">
                <button
                  className="rounded-md bg-indigo-500 px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 text-center text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  onClick={handleIngest}
                >
                  {loading ? 'Ingesting...' : message ? message : 'Ingest'}
                </button>
              </div>
            )}
            {uploadedFiles.length > 0 && (
              <div className='w-full mt-2 sm:mt-4   text-gray-600 dark:text-white '>
                <h2 className='text-lg font-semibold my-2'>Uploaded Files</h2>
                {uploadedFiles.map((fileName, index) => (
                  <p key={index} className='text-sm'>{fileName}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
