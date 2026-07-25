import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import MessageInput from '../components/MessageInput';

export default function ChatPage() {
  const {
    conversations,
    activeId,
    activeConversation,
    isLoading,
    cooldown,
    error,
    send,
    clearChat,
    retryLast,
    newConversation,
    switchConversation,
    deleteConversation,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={switchConversation}
        onNew={newConversation}
        onDelete={deleteConversation}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen((s) => !s)} sidebarOpen={sidebarOpen} />

        <ChatContainer
          messages={activeConversation.messages}
          isLoading={isLoading}
          error={error}
          retryLast={retryLast}
          onClear={clearChat}
        />

        <MessageInput onSend={send} disabled={isLoading || cooldown} />
      </div>
    </div>
  );
}