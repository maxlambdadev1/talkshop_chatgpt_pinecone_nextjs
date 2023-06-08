import { ConversationMessage } from '@/types/ConversationMessage';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from '../libs/localStorage';

export function useChats(namespace: string, userEmail: string) {
  const [chatList, setChatList] = useState<any[]>([]);
  const [chatNames, setChatNames] = useState<any>({});
  const [selectedChatId, setSelectedChatId] = useState<string>('');

  useEffect(() => {
    const fetchChatList = async (namespace: string, userEmail: string) => {
      try {
        const response = await fetch(
          `/api/chat/all?namespace=${namespace}&userEmail=${userEmail}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await response.json();

        if (response.ok) {
          setChatList(data);
        } else {
          console.error(data.error);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };
    if (!!namespace && !!userEmail) fetchChatList(namespace, userEmail);
  }, [namespace, userEmail]);

  useEffect(() => {
    if (!!chatList && chatList.length > 0) {
      const temp : any = {};
      chatList.forEach((chat : any) => {temp[chat.chatId] = chat?.title})
      setChatNames(temp);
    }
  }, [chatList]);

  const getConversation = async (chatId: string) => {
      const fetchMessages = async (chatId : string, namespace: string, userEmail: string) => {
        try {
          const response = await fetch(
            `/api/message/all?chatId=${chatId}&namespace=${namespace}&userEmail=${userEmail}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          );
          const data = await response.json();
          if (response.ok) {
            return data;
          } else return [];
        } catch (error: any) {
          console.error(error.message);
          return [];
        }
      };
      if (!!chatId && !!namespace && !!userEmail) {
        const messages  = fetchMessages(chatId, namespace, userEmail);
        return messages;
      } else  return [];
    };

  async function updateChatName(chatId: string, newChatName: string) {
    try {
      const response = await fetch(`/api/chat/update`, {
        method : 'PUT', 
        headers : {
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({
          chatId , title : newChatName, namespace 
        })
      })
      const res = response.json();

      if (response.ok) {
        const updatedChatNames = {...chatNames, [chatId]: newChatName };
        console.log('updatedChatNames')
        setChatNames(updatedChatNames);
      }
    } catch(err) {
      console.log('error', err);
    }
  }

  async function createChat(title : string) {
    const chatId = uuidv4();        
    try {
      const response = await fetch(
        `/api/chat/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body : JSON.stringify({
            chatId , title, namespace, userEmail 
          })
        },
      );
      const data = await response.json();

      if (response.ok) {
        const updatedChatList = [...chatList, {...data }];
        setChatList(updatedChatList);
        return chatId;
      } else {
        console.error(data.error);
      }
    } catch (error: any) {
      console.error(error.message);
    }
    return '';
  }

  async function deleteChat(chatIdToDelete: string) {
    try {
      const response = await fetch(`/api/chat/delete`, {
        method : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({
          chatId : chatIdToDelete ,  namespace 
        })
      })

      if (response.ok) {
        const updatedChatList:any = chatList.filter(
          (chat : any) => chat?.chatId !== chatIdToDelete,
        );
        setChatList(updatedChatList);
    
        if (chatIdToDelete === selectedChatId) {
          const deletedChatIndex = chatList.findIndex(
            (chat : any) => chat.chatId === chatIdToDelete,
          );
          let newSelectedChatId = '';
          if (updatedChatList[deletedChatIndex]) {
            newSelectedChatId = updatedChatList[deletedChatIndex].chatId;
          } else if (deletedChatIndex > 0) {
            newSelectedChatId = updatedChatList[deletedChatIndex - 1].chatId;
          }
          setSelectedChatId(newSelectedChatId);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  const filteredChatList = chatList.filter(
    (chat) => chat.namespace === namespace,
  );

  return {
    chatList,
    selectedChatId,
    setSelectedChatId,
    createChat,
    deleteChat,
    chatNames,
    updateChatName,
    filteredChatList,
    getConversation,
  };
}
