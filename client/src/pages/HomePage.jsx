import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-white dark:bg-slate-950">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-maroon-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-white">
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

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          AI Chatbot
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400">
          A modern, full-stack assistant built with React, Vite, Tailwind, Express, and OpenAI.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/chat"
            className="rounded-xl bg-maroon-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-maroon-700"
          >
            Start Chatting
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-900"
          >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </div>
    </div>
  );
}