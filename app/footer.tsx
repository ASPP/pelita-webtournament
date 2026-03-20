'use client';

import { useEffect, useState } from 'react';

interface FooterProps {
  messages: string[];
  autoOpenOnMessage?: boolean; // config 1
  showIconWhenClosed?: boolean; // config 2
}

export default function MessageFooter({
  messages,
  autoOpenOnMessage = true,
  showIconWhenClosed = true,
}: FooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(messages.length);

  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev) {
      setIsOpen(false);
    }
  }, [isDev]);

  // Detect new messages
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      if (autoOpenOnMessage && !isDev) {
        setIsOpen(true);
      }
      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount, autoOpenOnMessage, isDev]);

  // Fully hidden (no icon, no footer)
  if (!isOpen && !showIconWhenClosed) return null;

  return (
    <>
      {/* Collapsed Icon */}
      {!isOpen && showIconWhenClosed && (
        <div className="fixed bottom-4 right-4 z-30 group">
          <button
            onClick={() => {
              setIsOpen(true);
            }}
            className={`
              p-2 rounded-full bg-gray-800 text-white shadow-lg
              transition-opacity duration-300
              ${isDev ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
              hover:bg-gray-700
            `}
          >
            💬
          </button>
        </div>
      )}

      {/* Footer */}
      {isOpen && (
        <footer
          onClick={() => {
            setIsOpen(false);
          }}
          className="fixed bottom-0 left-0 z-20 w-full p-4 bg-white border-t border-gray-200 shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 dark:border-gray-600"
        >
          <div className="flex justify-between w-full items-start">
            <div>
              <h2 className="text-xs text-slate-400">ZeroMQ Messages:</h2>
              <ul>
                {messages.slice(-1).map((message, index) => (
                  <li
                    key={index}
                    className="text-xs text-slate-400"
                    style={{ fontSize: `0.45rem`, lineHeight: `0.5rem` }}
                  >
                    {message}
                  </li>
                ))}
              </ul>
            </div>

            {/* Collapse Button */}
            <button
              onClick={e => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="ml-4 text-xs text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </footer>
      )}
    </>
  );
}
