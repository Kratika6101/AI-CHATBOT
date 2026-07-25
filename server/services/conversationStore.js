import { logger } from '../utils/logger.js';

const MAX_CONVERSATIONS = 20;
const MAX_MESSAGES_PER_CONVERSATION = 50;
const MAX_INPUT_LENGTH = 2000;
const ESTIMATED_TOKENS_PER_CHAR = 0.25;
const MAX_TOTAL_TOKENS = 120000;
const CONVERSATION_TTL_MS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

const conversations = new Map();

let cleanupInterval = null;

function startCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const toDelete = [];
    for (const [id, conv] of conversations) {
      if (now - new Date(conv.updatedAt).getTime() > CONVERSATION_TTL_MS) {
        toDelete.push(id);
      }
    }
    for (const id of toDelete) {
      conversations.delete(id);
    }
    if (toDelete.length > 0) {
      logger.info('Cleaned up expired conversations', { count: toDelete.length });
    }
  }, CLEANUP_INTERVAL_MS);
}

export function getConversation(sessionId) {
  if (!sessionId) {
    sessionId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, {
      id: sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tokenCount: 0,
    });
  }

  const conv = conversations.get(sessionId);
  conv.updatedAt = new Date().toISOString();
  return conv;
}

export function appendMessage(sessionId, role, content) {
  const conv = getConversation(sessionId);
  const trimmed = (content || '').trim();
  const messageTokens = Math.ceil(trimmed.length * ESTIMATED_TOKENS_PER_CHAR);

  conv.messages.push({
    role,
    content: trimmed,
    createdAt: new Date().toISOString(),
    tokenCount: messageTokens,
  });

  conv.tokenCount += messageTokens;
  conv.updatedAt = new Date().toISOString();

  trimConversationMessages(conv);
  return conv;
}

export function getHistory(sessionId) {
  const conv = getConversation(sessionId);
  return conv.messages.map((m) => ({ role: m.role, content: m.content }));
}

export function clearConversation(sessionId) {
  conversations.delete(sessionId);
}

export function getAllConversations() {
  return Array.from(conversations.values())
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((c) => ({
      id: c.id,
      messageCount: c.messages.length,
      tokenCount: c.tokenCount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
}

export function getStats() {
  return {
    totalConversations: conversations.size,
    totalMessages: Array.from(conversations.values()).reduce((sum, c) => sum + c.messages.length, 0),
    totalTokens: Array.from(conversations.values()).reduce((sum, c) => sum + c.tokenCount, 0),
  };
}

function enforceLimits() {
  if (conversations.size > MAX_CONVERSATIONS) {
    const sorted = Array.from(conversations.entries())
      .sort((a, b) => new Date(a[1].updatedAt) - new Date(b[1].updatedAt));

    const toRemove = sorted.slice(0, conversations.size - MAX_CONVERSATIONS);
    for (const [id] of toRemove) {
      conversations.delete(id);
    }
  }
}

function trimConversationMessages(conv) {
  if (conv.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
    const removed = conv.messages.splice(0, conv.messages.length - MAX_MESSAGES_PER_CONVERSATION);
    for (const msg of removed) {
      conv.tokenCount -= msg.tokenCount || 0;
    }
  }

  while (conv.tokenCount > MAX_TOTAL_TOKENS && conv.messages.length > 2) {
    const removed = conv.messages.shift();
    if (removed) {
      conv.tokenCount -= removed.tokenCount || 0;
    }
  }

  if (conv.tokenCount < 0) conv.tokenCount = 0;
}

startCleanup();