/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ChatAction, useChat } from '@/context/ChatContext';
import { CgClose } from 'react-icons/cg';
import chatView from '@/styles/chatView.module.css'
import { useEffect, useRef, useState } from 'react';
import BotMessage from './BotMessage';
import UserMessage from './UserMessage';
import { IoSend } from 'react-icons/io5';
import Image from 'next/image';
import CustomAlert from './CustomAlert';
import { ChatActionSelector, LanguageSwitcher, ToneSelector } from './ChatComponents';
import { postWithAuth } from '@/utils/apiClient';

type Message = {
  type: 'user' | 'bot' | 'system';
  text: string;
  metadata?: {
    showLanguageSwitcher?: boolean;
    showToneSelector?: boolean;
  };
};


export default function ChatWindow() {
  const { chatId } = useChat();
  console.log("chatId", chatId)
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { isOpen, toggleChat, documentName, action, documentId, updateAction } = useChat();
  const [chatHistories, setChatHistories] = useState<Record<ChatAction, Message[]>>({
    summarize: [],
    generate: [],
    qa: [],
    tone: [],
    translate: [],
  });
  const currentMessages = chatHistories[action ?? 'qa'];

  const updateMessages = (newMessages: Message[]) => {
    if (!action) return;
    setChatHistories((prev) => ({
      ...prev,
      [action]: newMessages,
    }));
  };

  const handleClose = async () => {
    toggleChat();
  };


  const handleSend = async () => {
    if (!input.trim() || !action || action === 'translate' || action === 'tone') return;

    const newMessages: Message[] = [...(chatHistories[action] ?? []), { type: 'user', text: input }];
    updateMessages(newMessages);
    setInput('');
    setLoading(true);

    if (action === 'qa') {
      const formData = new FormData();
      formData.append("chat_id", chatId || '');
      formData.append("message", input);

      const res = await postWithAuth("qa-chat", formData);
      console.log("data qa msg: ", res)
      updateMessages([...newMessages, { type: 'bot', text: res.response }]);
      setLoading(false);
    } else {
      try {
        const endpoint = getEndpoint(action);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ message: input, documentId, chatId, action }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        updateMessages([...newMessages, { type: 'bot', text: data.response }]);
        setLoading(false);
      } catch (err) {
        console.log('error chat:: ', err);
        updateMessages([...newMessages, { type: 'bot', text: 'Sorry, something went wrong.' }]);
      } finally {
        setLoading(false);
      }
    }


  };


  const getEndpoint = (action: ChatAction): string => {
    switch (action) {
      case 'summarize': return '/api/summarize';
      case 'generate': return '/api/generate';
      case 'qa': return '/api/qa';
      case 'tone': return '/api/tone';
      case 'translate': return '/api/translate';
      default: return '';
    }
  };



  const handleToneChange = async (selectedTone: string) => {
    setSelectedTone(selectedTone);

    if (action === 'tone') {
      const userMessage = selectedTone;
      const newMessages: Message[] = [...(chatHistories[action] ?? []), { type: 'user', text: userMessage }];
      updateMessages(newMessages);
      setLoading(true);

      try {
        const endpoint = getEndpoint(action);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ documentId, action, tone: selectedTone }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        updateMessages([...newMessages, { type: 'bot', text: data.response }]);
      } catch (err) {
        console.error('error in changing tone::', err);
        updateMessages([...newMessages, { type: 'bot', text: 'Sorry, something went wrong.' }]);
      } finally {
        setLoading(false);
      }
    }
  };


  const handleLanguageChange = async (lang: { label: string; value: string }) => {
    setLanguage(lang.value);

    if (action === 'translate') {
      const userMessage = lang.label;
      const newMessages: Message[] = [...(chatHistories[action] ?? []), { type: 'user', text: userMessage }];
      updateMessages(newMessages);
      setLoading(true);

      try {
        const endpoint = getEndpoint(action);
        const res = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify({ documentId, action, language: lang.value }),
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        updateMessages([...newMessages, { type: 'bot', text: data.response }]);
      } catch (err) {
        console.error('error in translate::', err);
        updateMessages([...newMessages, { type: 'bot', text: 'Sorry, something went wrong.' }]);
      } finally {
        setLoading(false);
      }
    }
  };




  const handleActionChange = (value: string) => {
    if (
      value === 'summarize' ||
      value === 'generate' ||
      value === 'qa' ||
      value === 'tone' ||
      value === 'translate'
    ) {
      updateAction(value);

      // const systemMessage: Message = {
      //   type: 'system',
      //   text: `You are now in ${value.toUpperCase()} mode.`,
      // };

      // setChatHistories((prev) => ({
      //   ...prev,
      //   [value]: [...(prev[value] ?? []), systemMessage],
      // }));
    }
  };


  const autoSummarize = async () => {
    updateMessages([{ type: 'system', text: 'Summarizing the document...' }]);
    setLoading(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        body: JSON.stringify({ message: "give me a summery", documentId, action }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      updateMessages([
        { type: 'system', text: 'Summarizing the document...' },
        { type: 'bot', text: data.response }
      ]);
    } catch (error) {
      console.log("error : ", error)
      updateMessages([{ type: 'bot', text: 'Failed to summarize the document.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toneCheck = async () => {
    updateMessages([{ type: 'system', text: 'Sentiment analyzing...' }]);
    setLoading(true);
    try {
      const res = await fetch('/api/tone', {
        method: 'POST',
        body: JSON.stringify({ message: "What is the tone of this?", documentId, action }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      updateMessages([
        { type: 'system', text: 'Sentiment analyzing...' },
        { type: 'bot', text: data.response }
      ]);
    } catch (error) {
      console.log("error : ", error)
      updateMessages([{ type: 'bot', text: 'Failed to analyze sentiment of the document.' }]);
    } finally {
      setLoading(false);
    }
  };

  const translate = async () => {
    updateMessages([{ type: 'system', text: 'Translating text...' }]);
    setLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({ language: '', documentId, action }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      updateMessages([
        { type: 'system', text: 'Translating text...' },
        { type: 'bot', text: data.response }
      ]);
    } catch (error) {
      console.log("error : ", error)
      updateMessages([{ type: 'bot', text: 'Failed to translate the document.' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !action) return;

    if (action === 'summarize') {
      autoSummarize();
    } else if (action === 'tone') {
      console.log("tone: ", action)
      toneCheck();
    } else if (action === 'translate') {
      console.log("translate: ", action)
      translate();
    } else {
      const systemMessage: Message = {
        type: 'system',
        text: `You are now in ${action.toUpperCase()} mode.`,
      };
      setChatHistories((prev) => ({
        ...prev,
        [action]: [...(prev[action] ?? []), systemMessage],
      }));
    }
  }, [isOpen, action]);

  useEffect(() => {
    if (!isOpen) {
      setInput('');
      setLoading(false);
    }
  }, [isOpen]);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);


  if (!isOpen) return null;

  return (
    <>
      <div className={`position-fixed bg-white shadow ${chatView.chat_window}`}>
        <div className={`d-flex justify-content-between align-items-center px-3 py-2 border-bottom ${chatView.chat_header}`}>
          <div className="d-flex flex-row">
            <Image src="/icons8-ai-24.png" alt="ai icon" width={22} height={22} />
            <p className="mb-0 ms-2 me-3">Ai Assistant</p>
            <ChatActionSelector action={action ?? 'qa'} onChange={handleActionChange} />
          </div>
          <CgClose onClick={handleClose} style={{ cursor: 'pointer' }} />
        </div>

        <div className={`${chatView.chat_body_container}`}>
          <div className={`${chatView.chat_body}`} >
            {documentName && (
              <CustomAlert text={`You can continue with "${documentName}"`} />
            )}
            {currentMessages.map((msg, i) => {
              if (msg.type === 'user') return <UserMessage key={i} text={msg.text} />;
              if (msg.type === 'bot') return <BotMessage key={i} text={msg.text} />;
              if (msg.type === 'system') {
                return (
                  <div key={i}>
                    <CustomAlert text={msg.text} />
                  </div>
                );
              }
            })}


            {loading && <BotMessage text="Typing..." />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-top d-flex p-2">
          {action === 'translate' && (
            <LanguageSwitcher onChange={handleLanguageChange} />
          )}
          {action === 'tone' && (
            <ToneSelector onChange={handleToneChange} />
          )}
          {(action !== 'translate' && action !== 'tone') && (
            <>
              <input
                type="text"
                className={`${chatView.user_input} form-control me-2`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
              />
              <button
                className={`${chatView.send_button}`}
                onClick={handleSend}
              >
                <IoSend />
              </button>
            </>
          )}
        </div>

      </div>
    </>
  );
}
