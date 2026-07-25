import React from 'react';

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-1" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-maroon-400 dark:bg-maroon-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: '600ms' }}
        />
      ))}
    </div>
  );
}

export default React.memo(LoadingDots);