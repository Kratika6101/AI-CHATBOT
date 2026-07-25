import React from 'react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          isUser
            ? 'bg-maroon-600 text-white dark:bg-maroon-500'
            : 'bg-maroon-600 text-white'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-maroon-600 text-white dark:bg-maroon-500'
            : 'rounded-tl-sm border border-gray-200 bg-white text-gray-900 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-100'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.createdAtFormatted && (
          <span
            className={`mt-1 block text-[11px] ${
              isUser ? 'text-maroon-100' : 'text-gray-400'
            }`}
          >
            {message.createdAtFormatted}
          </span>
        )}
      </div>
    </div>
  );
}