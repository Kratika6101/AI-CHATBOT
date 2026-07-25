import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          {sidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M4 12h16M4 6h16M4 18h16"/>
            </svg>
          )}
        </button>
        <h1 className="text-lg font-semibold text-maroon-600 dark:text-maroon-400">
          ChatGPT
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}