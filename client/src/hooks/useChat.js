import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { sendMessage, checkHealth } from '../services/chatApi';
import { generateId, sanitizeText } from '../utils/helpers';
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

let persistTimer = null;
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
  const isMountedRef = useRef(true);
  const cooldownTimerRef = useRef(null);
  const sessionIdMapRef = useRef(new Map());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      persistConversations(conversations);
    }, 100);
    return () => {
      if (persistTimer) clearTimeout(persistTimer);
    };
  }, [conversations]);

  const startCooldown = useCallback((ms = 2000) => {
    setCooldown(true);
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    cooldownTimerRef.current = setTimeout(() => setCooldown(false), ms);
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

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
      setActiveId((current) => {
        if (current === id) {
          return next.length > 0 ? next[0].id : null;
        }
        return current;
      });
      return next;
    });
  }, []);

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
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, messages: [], updatedAt: new Date().toISOString() } : c
      )
    );
    setError(null);
    setIsLoading(false);
  }, [activeId]);

  const send = useCallback(
    async (content) => {
      if (isLoading || cooldown) return;

      let currentId = activeId;

      const userMessage = {
        id: generateId(),
        role: 'user',
        content: sanitizeText(content),
        createdAt: new Date().toISOString(),
      };

      setConversations((prev) => {
        const list = prev;
        if (currentId) {
          const conv = list.find((c) => c.id === currentId);
          const sessionId = conv?.sessionId || null;
          return list.map((c) =>
            c.id === currentId
              ? {
                  ...c,
                  messages: [...c.messages, userMessage],
                  title: c.messages.length === 0 ? userMessage.content.slice(0, 50) || 'New Chat' : c.title,
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
          title: userMessage.content.slice(0, 50) || 'New Chat',
          sessionId: null,
          messages: [userMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setActiveId(id);
        return [newConversation, ...list];
      });

      setError(null);
      setIsLoading(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const sessionId = sessionIdMapRef.current.get(currentId);

        const data = await sendMessage({
          message: content,
          sessionId,
          signal: abortControllerRef.current.signal,
        });

        if (data.sessionId && currentId) {
          sessionIdMapRef.current.set(currentId, data.sessionId);
          updateConversation(currentId, { sessionId: data.sessionId });
        }

        const assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.reply || 'No response.',
          createdAt: new Date().toISOString(),
        };

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
        return assistantMessage;
      } catch (err) {
        const response = err?.response;
        const backendMessage = response?.data?.message;
        const fallback = err?.message || 'Something went wrong';
        const message = backendMessage || fallback;
        const status = response?.status;
        startCooldown(1000);
        const display = [message, status && `(HTTP ${status})`].filter(Boolean).join(' ');
        setError(display);
        throw err;
      } finally {
        setIsLoading(false);
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

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: c.messages.filter(
                (m) => !(m.role === 'assistant' && m.id === c.messages[c.messages.length - 1]?.id)
              ),
            }
          : c
      )
    );

    setError(null);
    await send(trimmed);
  }, [activeId, conversations, send]);

  const formattedActive = useMemo(() => {
    if (!activeConversation) return { id: null, messages: [], title: '' };
    return {
      ...activeConversation,
      messages: activeConversation.messages.map((m) => ({
        ...m,
        createdAtFormatted: formatTimestamp(new Date(m.createdAt)),
      })),
    };
  }, [activeConversation]);

  const formattedConversations = useMemo(
    () =>
      conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) => ({
          ...m,
          createdAtFormatted: formatTimestamp(new Date(m.createdAt)),
        })),
      })),
    [conversations]
  );

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