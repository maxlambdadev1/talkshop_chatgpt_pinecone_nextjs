import React, {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ConversationMessage } from '@/types/ConversationMessage';
import { Document } from 'langchain/document';
import { Message } from '@/types';
import useNamespaces from '@/hooks/useNamespaces';
import { useChats } from '@/hooks/useChats';
import MessageList from '@/components/main/MessageList';
import ChatForm from '@/components/main/ChatForm';
import SidebarList from '@/components/sidebar/SidebarList';
import EmptyState from '@/components/main/EmptyState';
import Header from '@/components/header/Header';
import { useLocalStorage } from '@/libs/localStorage';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [modelTemperature, setModelTemperature] = useState<number>(0.5);

  const [userInfo, setUserInfo] = useLocalStorage<any>('userInfo', {});

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => router.push('/login'),
  });
  const [returnSourceDocuments, setReturnSourceDocuments] =
    useState<boolean>(false);

  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userImage, setUserImage] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    if (!!userInfo && !!userInfo.role ) setUserRole(userInfo.role);
  }, [userInfo])

  const {
    namespaces,
    selectedNamespace,
    setSelectedNamespace,
    isLoadingNamespaces,
  } = useNamespaces();

  const {
    chatList,
    selectedChatId,
    setSelectedChatId,
    createChat,
    deleteChat,
    chatNames,
    updateChatName,
    filteredChatList,
    getConversation,
  } = useChats(selectedNamespace.realName, userEmail);

  const userHasNamespaces = namespaces.length > 0;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<{
    messages: ConversationMessage[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [],
    history: [],
  });

  function mapConversationMessageToMessage(
    ConversationMessage: ConversationMessage,
  ): Message {
    return {
      ...ConversationMessage,
      sourceDocs: ConversationMessage.sourceDocs?.map((doc) => ({
        pageContent: doc.pageContent,
        metadata: { source: doc.metadata.source },
      })),
    };
  }

  const { messages, history } = conversation;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const fetchChatHistory = useCallback(async () => {
    try {
      const conversations = await getConversation(selectedChatId);
      console.log('conversations', conversations);
      if (!conversations) {
        console.error('Failed to fetch chat history: No conversations found.');
        return;
      }

      const initialConversation = {
        messages: [
          {
            message: 'Hi, what would you like to know about these documents?',
            type: 'apiMessage' as const,
          },
        ],
        history: [],
      };

      if (conversations.length > 0) {
        const pairedMessages: [any, any][] = [];
        const data = conversations;

        for (let i = 0; i < data.length; i += 2) {
          pairedMessages.push([data[i], data[i + 1]]);
        }

        setConversation((conversation: any) => ({
          ...conversation,
          messages: [...initialConversation.messages,
          ...data.map((message: any) => ({
            type: message.sender === 'user' ? 'userMessage' : 'apiMessage',
            message: message.content,
            sourceDocs: message.sourceDocs?.map((doc: any) => ({
              pageContent: doc.pageContent,
              metadata: { source: doc.metadata.source },
            })),
          }))],
          history: [...initialConversation.history,
          ...pairedMessages.map(([userMessage, botMessage]: any) => [
            userMessage.content,
            botMessage?.content || '',
          ])],
        }));
      } else {
        setConversation(initialConversation);
      }

    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  }, [selectedChatId]);

  const getUserInfo = async () => {
    try {
      const response = await fetch(`/api/user`);      
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        console.log('error', data.error);
        return {};
      }
    } catch(err) {
      console.log('err', err);
      return {};
    }
  }
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      setUserEmail(session.user.email);
      getUserInfo().then((user:any) => {
        setUserInfo(user);
      })
      if (session?.user?.name) {
        setUserName(session.user.name);
      }
      if (session?.user?.image) {
        setUserImage(session.user.image);
      }
    }
  }, [status, session]);

  useEffect(() => {
    if (!!selectedNamespace.realName && chatList.length > 0 && !selectedChatId) {
      setSelectedChatId(chatList[0].chatId);
    }
  }, [
    selectedNamespace,
    chatList,
    selectedChatId,
    setSelectedChatId,
  ]);

  useEffect(() => {
    if (chatList.length > 0) {
      setSelectedChatId(chatList[chatList.length - 1].chatId);
    }
  }, [
    selectedNamespace,
    setSelectedChatId,
    chatList,
  ]);

  useEffect(() => {
    if (selectedChatId) {
      console.log('selectedChatId', selectedChatId)
      fetchChatHistory();
    }
  }, [
    selectedChatId,
    fetchChatHistory,
  ]);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();
    setConversation((conversation) => ({
      ...conversation,
      messages: [
        ...conversation.messages,
        {
          type: 'userMessage',
          message: question,
        } as ConversationMessage,
      ],
    }));

    setLoading(true);
    setQuery('');

    console.log('history', history);
    const response = await fetch('/api/message/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        history: conversation.history,
        chatId: selectedChatId,
        selectedNamespace : selectedNamespace.realName,
        returnSourceDocuments,
        modelTemperature,
        userEmail,
      }),
    });

    const data = await response.json();

    if (data.error) {
      setError(data.error);
    } else {
      setConversation((prevConversation) => {
        const updatedConversation = {
          ...prevConversation,
          messages: [
            ...prevConversation.messages,
            {
              type: 'apiMessage',
              message: data.text,
              sourceDocs: data.sourceDocuments
                ? data.sourceDocuments.map(
                  (doc: any) =>
                    new Document({
                      pageContent: doc.pageContent,
                      metadata: { source: doc.metadata.source },
                    }),
                )
                : undefined,
            } as ConversationMessage,
          ],
          history: [
            ...prevConversation.history,
            [question, data.text] as [string, string],
          ],
        };

        return updatedConversation;
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!!conversation) {
      let element: any = messageListRef.current;
      if (!!element) {
        window.scrollTo(0, element.scrollHeight);
      }
    }
  }, [conversation])

  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const nameSpaceHasChats = filteredChatList.length > 0;

  return (
    <>
      <div className="h-full">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                    <div className="flex h-16 shrink-0 items-center"></div>
                    <SidebarList
                      createChat={createChat}
                      selectedNamespace={selectedNamespace}
                      setSelectedNamespace={setSelectedNamespace}
                      namespaces={namespaces}
                      filteredChatList={filteredChatList.map(
                        (chat) => chat.chatId,
                      )}
                      selectedChatId={selectedChatId}
                      setSelectedChatId={setSelectedChatId}
                      setConversation={setConversation}
                      chatNames={chatNames}
                      updateChatName={updateChatName}
                      deleteChat={deleteChat}
                      returnSourceDocuments={returnSourceDocuments}
                      setReturnSourceDocuments={setReturnSourceDocuments}
                      modelTemperature={modelTemperature}
                      setModelTemperature={setModelTemperature}
                      nameSpaceHasChats={nameSpaceHasChats}
                      isLoadingNamespaces={isLoadingNamespaces}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col h-screen overflow-y-hidden">
          <div className="flex grow flex-col bg-gray-900 pb-4 border-r border-gray-800 h-full">
            <div className="flex h-8 shrink-0 items-center"></div>
            <SidebarList
              createChat={createChat}
              selectedNamespace={selectedNamespace}
              setSelectedNamespace={setSelectedNamespace}
              namespaces={namespaces}
              filteredChatList={filteredChatList.map((chat) => chat.chatId)}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              setConversation={setConversation}
              chatNames={chatNames}
              updateChatName={updateChatName}
              deleteChat={deleteChat}
              returnSourceDocuments={returnSourceDocuments}
              setReturnSourceDocuments={setReturnSourceDocuments}
              modelTemperature={modelTemperature}
              setModelTemperature={setModelTemperature}
              nameSpaceHasChats={nameSpaceHasChats}
              isLoadingNamespaces={isLoadingNamespaces}
            />
          </div>
        </div>

        <div className="lg:pl-72 h-screen"
          ref={messageListRef}
        >
          <Header setSidebarOpen={setSidebarOpen}
            sidebarOpen={sidebarOpen}
            userImage={userImage}
            userName={userName}
            userRole={userRole}
          />

          <main className="flex flex-col">
            {!!selectedNamespace?.realName && nameSpaceHasChats ? (
              <div className="flex-grow pb-48">
                <div className="h-full">
                  <MessageList
                    messages={messages.map(mapConversationMessageToMessage)}
                    loading={loading}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                nameSpaceHasChats={nameSpaceHasChats}
                selectedNamespace={selectedNamespace}
                userHasNamespaces={userHasNamespaces}
                userRole={ userRole}
              />
            )}

            {nameSpaceHasChats && !!selectedNamespace?.realName && (
              <div className="fixed w-full bottom-0 flex bg-gradient-to-t from-gray-800 to-gray-800/0 justify-center lg:pr-72">
                <ChatForm
                  loading={loading}
                  error={error}
                  query={query}
                  textAreaRef={textAreaRef}
                  handleEnter={handleEnter}
                  handleSubmit={handleSubmit}
                  setQuery={setQuery}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
