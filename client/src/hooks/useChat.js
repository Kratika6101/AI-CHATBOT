import React, { useState, useEffect, useCallback, useRef } from 'react';
import { sendMessage, checkHealth } from '../services/chatApi';
import { generateId } from '../utils/helpers';
import { CHAT_STORAGE_KEY } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';

const loadConversations = () => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c) => c && typeof c === 'object');
  } catch {
    return [];
  }
};

const persistConversations = (conversations) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
  } catch {}
};

export function useChat() {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => {
    const list = loadConversations();
    return list[0]?.id || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const abortControllerRef = useRef(null);
  const conversationsRef = useRef(conversations);
  const isMountedRef = useRef(true);
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    conversationsRef.current = conversations;
    return () => {
      isMountedRef.current = false;
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [conversations]);

  useEffect(() => {
    persistConversations(conversations);
  }, [conversations]);

  const startCooldown = useCallback((ms = 2000) => {
    setCooldown(true);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => setCooldown(false), ms);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const newConversation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const id = generateId();
    const conversation = {
      id,
      title: 'New Chat',
      sessionId: null,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(id);
    setError(null);
    setIsLoading(false);
  }, []);

  const switchConversation = useCallback((id) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveId(id);
    setError(null);
    setIsLoading(false);
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (activeId === id) {
        setActiveId((current) => {
          const remaining = next;
          return remaining.length > 0 ? remaining[0].id : null;
        });
      }
      return next;
    });
  }, [activeId]);

  const updateConversation = useCallback((id, updater) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updater, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (activeId) {
      updateConversation(activeId, { messages: [] });
    }
    setError(null);
    setIsLoading(false);
  }, [activeId, updateConversation]);

  const send = useCallback(
    async (content) => {
      if (isLoading || cooldown) return;

      let currentId = activeId;
      const userMessage = {
        id: generateId(),
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };

      const upsertUserMessage = (list) => {
        if (currentId) {
          const conv = list.find((c) => c.id === currentId);
          const sessionId = conv?.sessionId || null;
          return list.map((c) =>
            c.id === currentId
              ? {
                  ...c,
                  messages: [...c.messages, userMessage],
                  title:
                    c.messages.length === 0
                      ? content.slice(0, 50) || 'New Chat'
                      : c.title,
                  updatedAt: new Date().toISOString(),
                  sessionId,
                }
              : c
          );
        }
        const id = generateId();
        currentId = id;
        const newConversation = {
          id,
          title: content.slice(0, 50) || 'New Chat',
          sessionId: null,
          messages: [userMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setActiveId(id);
        return [newConversation, ...list];
      };

      setConversations((prev) => upsertUserMessage(prev));
      setError(null);
      setIsLoading(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const currentConv = conversationsRef.current.find((c) => c.id === currentId);
        const sessionId = currentConv?.sessionId || undefined;

        const data = await sendMessage({
          message: content,
          sessionId,
          signal: abortControllerRef.current.signal,
        });

        if (data.sessionId && currentId) {
          updateConversation(currentId, { sessionId: data.sessionId });
        }

        const assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.reply || 'No response.',
          createdAt: new Date().toISOString(),
        };

        if (isMountedRef.current && currentId) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === currentId
                ? {
                    ...c,
                    messages: [...c.messages, assistantMessage],
                    updatedAt: new Date().toISOString(),
                  }
                : c
            )
          );
        }
        return assistantMessage;
      } catch (err) {
        const response = err?.response;
        const backendMessage = response?.data?.message;
        const fallback = err?.message || 'Something went wrong';
        const message = backendMessage || fallback;
        const status = response?.status;
        startCooldown(1000);
        const display = [message, status && `(HTTP ${status})`].filter(Boolean).join(' ');
        if (isMountedRef.current) {
          setError(display);
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [isLoading, activeId, updateConversation, cooldown, startCooldown]
  );

  const retryLast = useCallback(async () => {
    const currentConv = conversations.find((c) => c.id === activeId);
    if (!currentConv) return;

    const userMessages = currentConv.messages.filter((m) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    if (!lastUserMessage) return;

    const trimmed = lastUserMessage.content.trim();
    if (!trimmed) return;

    updateConversation(activeId, {
      messages: currentConv.messages.filter(
        (m) => !(m.role === 'assistant' && m.id === currentConv.messages[currentConv.messages.length - 1]?.id)
      ),
    });

    setError(null);
    await send(trimmed);
  }, [activeId, conversations, send, updateConversation]);

  const formattedActive = activeConversation
    ? {
        ...activeConversation,
        messages: activeConversation.messages.map((m) => ({
          ...m,
          createdAtFormatted: formatTimestamp(new Date(m.createdAt)),
        })),
      }
    : { id: null, messages: [], title: '' };

  const formattedConversations = conversations.map((c) => ({
    ...c,
    messages: c.messages.map((m) => ({
      ...m,
      createdAtFormatted: formatTimestamp(new Date(m.createdAt)),
    })),
  }));

  return {
    conversations: formattedConversations,
    activeId,
    activeConversation: formattedActive,
    isLoading,
    cooldown,
    error,
    send,
    clearChat,
    retryLast,
    newConversation,
    switchConversation,
    deleteConversation,
  };
}

export function useHealthCheck() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;

    async function check() {
      try {
        const data = await checkHealth();
        if (isMounted) setStatus(data.status === 'ok' ? 'online' : 'degraded');
      } catch {
        if (isMounted) setStatus('offline');
      }
    }

    check();
    const interval = setInterval(check, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return status;
}