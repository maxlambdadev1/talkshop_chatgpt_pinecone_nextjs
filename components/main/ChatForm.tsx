import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExclamationCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/solid';
import Select from 'react-select';

type ChatFormProps = {
  loading: boolean;
  error: string | null;
  query: string;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  handleEnter: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setQuery: (query: string) => void;
  namespaces: any[];
  promptList: any[];
  selectedNamespaces: any[];
  setSelectedNamespaces: React.Dispatch<React.SetStateAction<any[]>>;
};

const ChatForm = ({
  loading,
  error,
  query,
  handleEnter,
  handleSubmit,
  setQuery,
  namespaces,
  promptList,
  selectedNamespaces,
  setSelectedNamespaces,
}: ChatFormProps) => {
  const otherRef = useRef<HTMLTextAreaElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const [selectData, setSelectData] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectCategories, setSelectCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>({});
  const [prompts, setPrompts] = useState<any[]>([]);

  const getDataCategories = async () => {
    try {
      const response = await fetch(
        `/api/getDataCategories`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const res = await response.json();

      if (response.ok) {
        setCategories(res.categories);
      } else {
        console.error(res.error);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    getDataCategories();
  }, []);

  useEffect(() => {
    if (namespaces.length > 0) {
      const tempData = namespaces.map((item: any) => ({ value: item.realName, label: item.name }))
      setSelectData(tempData);
    }
  }, [namespaces]);

  useEffect(() => {
    if (selectData.length > 0) {
      setSelectedData([selectData[0]]);
    }
  }, [selectData]);

  useEffect(() => {
    // const arr: any = [];
    // selectedData.forEach((item: any) => {
    //   let value = item.value;
    //   categories.forEach((item1: any) => { if (value === item1.dataName) arr.push(item1); });
    // })
    // const arr1 = arr.map((item: any) => ({ value: item.categoryName, label: item.categoryName }));
    // setSelectedCategory({});
    // setPrompts([]);
    // setSelectCategories(arr1)

    const arr: any[] = [];
    selectedData.forEach((item: any) => {
      let value = item.value;
      const arr1 = namespaces.filter((item) => item.realName === value);
      if (arr1.length > 0) arr.push(arr1[0]);
    })
    console.log('selectedData', selectedData, arr)
    setSelectedNamespaces(arr);
  }, [selectedData, categories]);

  const getPrompts = async (dataName: string, categoryName: string) => {
    try {
      const response = await fetch(
        `/api/getPrompts?dataName=${dataName}&categoryName=${categoryName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      const res = await response.json();

      if (response.ok) {
        setPrompts(res);
      } else {
        console.error(res.error);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    if (!!selectedCategory) {
      let dataName;
      let categoryName = selectedCategory.value;
      categories.forEach((item: any) => {
        if (item.categoryName === selectedCategory.value) {
          dataName = item.dataName;
        }
      })
      if (!!dataName && !!categoryName) getPrompts(dataName, categoryName);
    }
  }, [selectedCategory, categories]);


  const submitPrompt = (prompt: string) => {
    setQuery(prompt);
    setTimeout(() => {
      if (!!submitRef.current) submitRef.current.click();
    }, 100);
  }

  const adjustTextareaHeight = useCallback(() => {
    if (otherRef.current) {
      otherRef.current.style.height = 'auto';
      const computed = window.getComputedStyle(otherRef.current);
      const height =
        otherRef.current.scrollHeight +
        parseInt(computed.getPropertyValue('border-top-width'), 10) +
        parseInt(computed.getPropertyValue('padding-top'), 10) +
        parseInt(computed.getPropertyValue('padding-bottom'), 10) +
        parseInt(computed.getPropertyValue('border-bottom-width'), 10);

      otherRef.current.style.height = height > 250 ? '250px' : `${height}px`;
    }
  }, [otherRef]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [query, adjustTextareaHeight]);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgb(55 65 81 / 0.5)',
      borderColor: 'rgb(55 65 81 / 0.5)',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'rgb(209 213 219)'
    })
  };

  const onclickPrompt = (prompt : any) => {
    submitPrompt(prompt.name)
  }

  return (
    <div className='w-full'>
      <div className='w-full max-w-4xl m-auto px-4 sm:px-8'>
        <div className='w-full'>
          <div className='flex pt-8 sm:pt-4'>
            <div className='w-full sm:w-96 sm:mr-2'>
              <Select
                value={selectedData}
                onChange={(selectedData: any) => setSelectedData(selectedData)}
                options={selectData}
                isMulti
                menuPlacement='top'
                styles={customStyles}
              />
            </div>
            {/* <div className='w-full w-1/2 ml-2 sm:w-72 sm:ml-4'>
              <Select
                value={selectedCategory}
                onChange={(selectedCategory: any) => {setSelectedCategory(selectedCategory); }}
                options={selectCategories}
                menuPlacement='top'
                styles={customStyles}
              />
            </div> */}
            {selectedNamespaces.length > 0 && !!promptList && promptList.length > 0 && (
              <div className=''>
                {promptList.map((prompt: any, index: number) => (
                  <button key={index}
                    className='px-3 py-1 mb-1 mr-2 bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700/50 font-md rounded-2xl dark:text-gray-300 dark:hover:text-gray-100 border-2 border-gray-400'
                    onClick={() => onclickPrompt(prompt)}
                  >
                    {prompt.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <form
          onSubmit={handleSubmit}
          className="items-center w-full justify-center flex py-3 sm:pb-4"
        >
          <label htmlFor="userInput" className="sr-only">
            Your message
          </label>
          <div className="flex w-full align-center justify-center items-center rounded-lg bg-gray-170 shadow-2xl">
            <textarea
              disabled={loading}
              onKeyDown={handleEnter}
              ref={otherRef}
              className="flex items-center justify-center w-full text-xs sm:text-sm md:text-base rounded-lg border dark:bg-gray-900 border-gray-700 placeholder-gray-400 text-gray-800 dark:text-white focus:outline-none resize-none whitespace-pre-wrap overflow-y-auto"
              autoFocus={false}
              rows={1}
              maxLength={2048}
              id="userInput"
              name="userInput"
              placeholder={
                loading
                  ? 'Waiting for response...'
                  : error
                    ? 'Error occurred. Try again.'
                    : 'Your message...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            ref={submitRef}
            type="submit"
            disabled={loading}
            className="inline-flex justify-center p-2 rounded-full cursor-pointer text-blue-500 hover:text-blue-300"
          >
            {loading ? (
              <></>
            ) : error ? (
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
            ) : (
              <PaperAirplaneIcon className="h-6 w-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatForm;
