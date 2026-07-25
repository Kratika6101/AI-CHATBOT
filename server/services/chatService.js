import { generateWithGemini, generateWithGeminiStream } from '../config/gemini.js';
import { logger } from '../utils/logger.js';

export async function generateReply({ message, conversationHistory = [] }) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Invalid user message.');
  }

  const messages = [
    { role: 'system', content: 'You are a helpful, friendly AI assistant.' },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message.trim() },
  ];

  try {
    const reply = await generateWithGemini({ messages });
    return reply;
  } catch (error) {
    logger.error('Gemini API error', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });
    return getFallbackReply(error);
  }
}

export async function* generateReplyStream({ message, conversationHistory = [] }) {
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Invalid user message.');
  }

  const messages = [
    { role: 'system', content: 'You are a helpful, friendly AI assistant.' },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message.trim() },
  ];

  try {
    yield* generateWithGeminiStream({ messages });
  } catch (error) {
    logger.error('Gemini stream error', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });
    yield getFallbackReply(error);
  }
}

export function getFallbackReply(error) {
  logger.error('Returning fallback reply', { error: error?.message });

  if (error?.message?.includes('API key')) {
    return "The AI service is misconfigured. Please contact support.";
  }
  if (error?.message?.includes('quota') || error?.message?.includes('rate limit') || error?.status === 429) {
    return "I'm currently rate-limited. Please try again in a minute.";
  }
  if (error?.message?.includes('timeout') || error?.code === 'ECONNABORTED') {
    return "The request timed out. Please try again with a shorter message.";
  }
  if (error?.message?.includes('fetch failed') || error?.message?.includes('ECONNRESET')) {
    return "Network error. Please check your connection and try again.";
  }
  if (error?.status === 400) {
    return "Invalid request. Please rephrase your message.";
  }
  if (error?.status === 403) {
    return "Access denied. The API key may not have permission for this model.";
  }
  if (error?.status === 404) {
    return "The AI model is not available. Please contact support.";
  }
  if (error?.status && error.status >= 500) {
    return "The AI service is temporarily unavailable. Please try again shortly.";
  }

  return "Sorry, I'm having trouble connecting right now. Please try again later.";
}