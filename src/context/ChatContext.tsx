'use client';
import { v4 as uuidv4 } from 'uuid';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';


export type ChatAction = 'summarize' | 'generate' | 'qa' | 'tone' | 'translate';

type ChatOptions = {
  chatId?: string;
  documentId?: string;
  documentName?: string;
  action?: ChatAction;
};

type ChatState = {
  isOpen: boolean;
  chatId?: string;
  documentId?: string;
  documentName?: string;
  action?: ChatAction;
  toggleChat: (options?: ChatOptions) => void;
  updateAction: (newAction: ChatAction) => void;
};


const ChatContext = createContext<ChatState | undefined>(undefined);

const uploadDocumentVectors = async (chatId: string, documentId: string) => {
  const res = await fetch('/api/upsert-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, documentId }),
  });
  return res.json();
};

const deleteDocumentVectors = async (chatId: string) => {
  const res = await fetch('/api/delete-vectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId }),
  });
  return res.json();
};


export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [documentId, setDocumentId] = useState<string | undefined>();
  const [documentName, setDocumentName] = useState<string | undefined>();
  const [action, setAction] = useState<ChatAction | undefined>();
  const [chatId, setChatId] = useState<string | undefined>();

  
  const toggleChat = async (options?: ChatOptions) => {
    if (!options) {
      if (chatId) {
        await deleteDocumentVectors(chatId);
      }
      setIsOpen(false);
      setChatId(undefined);
      setDocumentId(undefined);
      setDocumentName(undefined);
      setAction(undefined);
      return;
    }
  
    const newChatId = options.chatId ?? chatId ?? uuidv4();
    const newDocumentId = options.documentId;
  
    if (newDocumentId) {
      await deleteDocumentVectors(newChatId);
      await uploadDocumentVectors(newChatId, newDocumentId);
    }
  
    setChatId(newChatId);
    setDocumentId(newDocumentId);
    setDocumentName(options.documentName);
    setAction(options.action);
    setIsOpen(true);
  };
  

  const updateAction = (newAction: ChatAction) => {
    setAction(newAction);
  };
  

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (chatId) {
        navigator.sendBeacon('/api/delete-vectors', JSON.stringify({ chatId }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [chatId]);

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, chatId,  documentId, documentName, action, updateAction }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatState => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};