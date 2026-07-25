import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ChatPage from './pages/ChatPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-slate-950 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}