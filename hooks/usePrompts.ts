import { ConversationMessage } from '@/types/ConversationMessage';
import { useState, useMemo, useCallback, useEffect } from 'react';

export function usePrompts(userEmail: string) {
  const [promptList, setPromptList] = useState<any[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');

  useEffect(() => {
    const fetchPromptList = async (userEmail: string) => {
      try {
        const response = await fetch(
          `/api/prompt/all?&userEmail=${userEmail}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();

        if (response.ok) {
          setPromptList(data);
        } else {
          console.error(data.error);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };
    if (!!userEmail) fetchPromptList(userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (!!promptList && promptList.length > 0) {
      const temp : any = {};
      promptList.forEach((prompt : any) => {temp[prompt._id] = prompt?.title})
    }
  }, [promptList]);

   async function updatePrompt(promptId: string, newPrompt: any) {
    try {
      const response = await fetch(`/api/prompt/update`, {
        method : 'PUT', 
        headers : {
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({
          promptId , ...newPrompt
        })
      })
      const res = await response.json();

      if (response.ok) {
        const temp = promptList;
        temp.forEach(item => {
          if (item._id === promptId) {
            item.name = newPrompt.name;
            item.description = newPrompt.description;
            item.prompt = newPrompt.prompt;
          }
        })
        setPromptList(temp);
      }
    } catch(err) {
      console.log('error', err);
    }
  }

  async function createPrompt(name : string) {
    try {
      const response = await fetch(
        `/api/prompt/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body : JSON.stringify({
            name,  userEmail 
          })
        },
      );
      const data = await response.json();

      if (response.ok) {
        const updatedPromptList = [{...data }, ...promptList];
        setPromptList(updatedPromptList);
        console.log('created prompt', data);
        return data;
      } else {
        console.error(data.error);
      }
    } catch (error: any) {
      console.error(error.message);
    }
    return '';
  }

  async function deletePrompt(promptIdToDelete: string) {
    try {
      const response = await fetch(`/api/prompt/delete`, {
        method : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({
          promptId : promptIdToDelete  
        })
      })

      if (response.ok) {
        const updatedPromptList:any = promptList.filter(
          (prompt : any) => prompt?._id !== promptIdToDelete,
        );
        setPromptList(updatedPromptList);
    
      }
    } catch (err) {
      console.log(err);
    }
  }

  return {
    promptList,
    selectedPromptId,
    setSelectedPromptId,
    createPrompt,
    deletePrompt,
    updatePrompt,
  };
}
