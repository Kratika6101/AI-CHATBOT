import React from 'react';

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, onClose, isOpen }) {
  const handleDelete = (e, id) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950 transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-3 dark:border-slate-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chat History</span>
            <div className="flex items-center gap-1">
              <button
                onClick={onNew}
                className="rounded-lg p-2 text-maroon-600 hover:bg-maroon-50 dark:text-maroon-400 dark:hover:bg-maroon-950"
                aria-label="New chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800 lg:hidden"
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {conversations.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                No conversations yet.
              </p>
            )}

            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`
                  group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition
                  ${
                    activeId === conv.id
                      ? 'bg-maroon-50 text-maroon-700 dark:bg-maroon-950 dark:text-maroon-300'
                      : 'text-gray-700 hover:bg-maroon-50 dark:text-gray-300 dark:hover:bg-maroon-950'
                  }
                `}
              >
                <span className="truncate pr-2">{conv.title || 'New Chat'}</span>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="shrink-0 rounded-lg p-1 text-gray-500 opacity-0 transition group-hover:opacity-100 hover:text-maroon-700 dark:text-gray-400 dark:hover:text-maroon-300"
                  aria-label="Delete conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="M3 6h18"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </button>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 p-3 dark:border-slate-800">
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              AI Chatbot Client
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}