'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface DebugMessagesContextType {
  debugMessages: string[];
  addDebugMessage: (msg: string) => void;
}

const DebugMessagesContext = createContext<DebugMessagesContextType | undefined>(undefined);

const MAX_MESSAGES = 30;

export function DebugMessagesProvider({ children }: { children: ReactNode }) {
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  const addDebugMessage = (msg: string) => {
    setDebugMessages(prev => [...prev.slice(-MAX_MESSAGES + 1), msg]);
  };

  return (
    <DebugMessagesContext.Provider value={{ debugMessages, addDebugMessage }}>
      {children}
    </DebugMessagesContext.Provider>
  );
}

export const useDebugMessages = () => {
  const context = useContext(DebugMessagesContext);
  if (!context) throw new Error('useDebugMessages must be used within DebugMessagesProvider');
  return context;
};
