import { ConversationMessage } from '@/types/ConversationMessage';
import { useState, useMemo, useCallback, useEffect } from 'react';

export function useChats(userEmail: string) {
  const [chatList, setChatList] = useState<any[]>([]);
  const [chatNames, setChatNames] = useState<any>({});
  const [selectedChatId, setSelectedChatId] = useState<string>('');

  useEffect(() => {
    const fetchChatList = async (userEmail: string) => {
      try {
        const response = await fetch(
          `/api/chat/all?&userEmail=${userEmail}`,
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
    if (!!userEmail) fetchChatList(userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (!!chatList && chatList.length > 0) {
      const temp : any = {};
      chatList.forEach((chat : any) => {temp[chat._id] = chat?.title})
      setChatNames(temp);
    }
  }, [chatList]);

  const getConversation = async (chatId: string) => {
      const fetchMessages = async (chatId : string) => {
        try {
          const response = await fetch(
            `/api/message/all?chatId=${chatId}`,
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
      if (!!chatId) {
        const messages  = fetchMessages(chatId);
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
          chatId , title : newChatName
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
    try {
      const response = await fetch(
        `/api/chat/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body : JSON.stringify({
            title,  userEmail 
          })
        },
      );
      const data = await response.json();

      if (response.ok) {
        const updatedChatList = [{...data }, ...chatList];
        setChatList(updatedChatList);
        setSelectedChatId(data._id);
        console.log('created chat', data);
        return data;
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
          chatId : chatIdToDelete  
        })
      })

      if (response.ok) {
        const updatedChatList:any = chatList.filter(
          (chat : any) => chat?._id !== chatIdToDelete,
        );
        setChatList(updatedChatList);
    
        if (chatIdToDelete === selectedChatId) {
          const deletedChatIndex = chatList.findIndex(
            (chat : any) => chat._id === chatIdToDelete,
          );
          let newSelectedChatId = '';
          if (updatedChatList[deletedChatIndex]) {
            newSelectedChatId = updatedChatList[deletedChatIndex]._id;
          } else if (deletedChatIndex > 0) {
            newSelectedChatId = updatedChatList[deletedChatIndex - 1]._id;
          }
          setSelectedChatId(newSelectedChatId);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  return {
    chatList,
    selectedChatId,
    setSelectedChatId,
    createChat,
    deleteChat,
    chatNames,
    updateChatName,
    getConversation,
  };
}
