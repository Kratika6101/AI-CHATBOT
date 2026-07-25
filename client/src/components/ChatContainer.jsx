import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

export default function ChatContainer({ messages, isLoading, error, retryLast, onClear }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-6">
        {messages.length === 0 && !isLoading && !error && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-maroon-50 p-3 dark:bg-maroon-950">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-maroon-600 dark:text-maroon-400">
                <path d="M12 8V4H8"/>
                <rect x="8" y="8" width="8" height="8" rx="2"/>
                <path d="M16 4h2"/>
                <path d="M20 8h2"/>
                <path d="M20 16h2"/>
                <path d="M16 20h2"/>
                <path d="M8 20H6"/>
                <path d="M4 16H2"/>
                <path d="M4 8H2"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              How can I help you today?
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Ask me anything. I can assist with coding, writing, analysis, brainstorming, and more.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
        </div>

        {isLoading && (
          <div className="mt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon-600 text-sm font-semibold text-white">
                AI
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
              !
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={retryLast}
                  className="text-xs font-medium underline text-maroon-700 dark:text-maroon-300"
                >
                  Retry
                </button>
                <button
                  onClick={onClear}
                  className="text-xs font-medium underline text-maroon-700 dark:text-maroon-300"
                >
                  Clear chat
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}