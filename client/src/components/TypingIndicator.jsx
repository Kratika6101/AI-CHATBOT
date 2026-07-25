import React from 'react';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 text-gray-500 dark:text-gray-400">
      <span className="h-2 w-2 rounded-full bg-maroon-400 dark:bg-maroon-500 animate-bounce [animation-delay:0ms]" />
      <span className="h-2 w-2 rounded-full bg-maroon-400 dark:bg-maroon-500 animate-bounce [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-maroon-400 dark:bg-maroon-500 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

export default React.memo(TypingIndicator);