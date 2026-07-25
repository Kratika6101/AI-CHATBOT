import React, { useState, useRef, useEffect } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-gray-300 bg-gray-50 px-3 py-2 transition focus-within:border-maroon-400 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-maroon-500 dark:focus-within:bg-slate-900"
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Send a message..."
          className="max-h-40 flex-1 resize-none bg-transparent py-1 text-sm outline-none disabled:opacity-60 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="mb-0.5 inline-flex items-center justify-center rounded-xl bg-maroon-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-maroon-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-maroon-500 dark:hover:bg-maroon-400 dark:disabled:bg-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M22 2L11 13"/>
            <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-gray-400 dark:text-gray-500">
        AI can make mistakes. Check important info.
      </p>
    </div>
  );
}