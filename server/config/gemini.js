import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

let genAIInstance = null;

function getGenAI() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Set it in server/.env and restart the server.');
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

export function getGeminiClient() {
  const genAI = getGenAI();
  const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest';
  const model = genAI.getGenerativeModel({ model: modelName });
  return { genAI, model, modelName };
}

export async function generateWithGemini({ messages }) {
  const { model, modelName } = getGeminiClient();

  const history = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === 'system') {
      history.push({ role: 'user', parts: [{ text: `[System instruction: ${m.content}]` }] });
    } else if (m.role === 'user') {
      history.push({ role: 'user', parts: [{ text: m.content }] });
    } else if (m.role === 'assistant') {
      history.push({ role: 'model', parts: [{ text: m.content }] });
    }
  }

  try {
    logger.info('Gemini chat request', { model: modelName, historyItems: history.length });

    const chat = model.startChat({ history });
    const lastUser = messages[messages.length - 1];
    const userText = lastUser?.content || 'Hello';
    const result = await chat.sendMessage(userText);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      logger.warn('Gemini empty response');
      return 'I received an empty response. Please try again.';
    }

    logger.info('Gemini response received', { length: text.length });
    return text.trim();
  } catch (error) {
    logger.error('Gemini API call failed', {
      model: modelName,
      messageCount: history.length,
      error: error?.message,
      status: error?.status,
      code: error?.code,
    });
    throw error;
  }
}

export async function* generateWithGeminiStream({ messages }) {
  const { model, modelName } = getGeminiClient();

  const history = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    if (m.role === 'system') {
      history.push({ role: 'user', parts: [{ text: `[System instruction: ${m.content}]` }] });
    } else if (m.role === 'user') {
      history.push({ role: 'user', parts: [{ text: m.content }] });
    } else if (m.role === 'assistant') {
      history.push({ role: 'model', parts: [{ text: m.content }] });
    }
  }

  try {
    logger.info('Gemini streaming request', { model: modelName, historyItems: history.length });
    const chat = model.startChat({ history });
    const lastUser = messages[messages.length - 1];
    const userText = lastUser?.content || 'Hello';
    const result = await chat.sendMessageStream(userText);

    let yielded = false;
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yielded = true;
        yield text;
      }
    }

    if (!yielded) {
      logger.warn('Gemini stream yielded no content');
      yield 'I received an empty response. Please try again.';
    }
  } catch (error) {
    logger.error('Gemini stream failed', {
      model: modelName,
      messageCount: history.length,
      error: error?.message,
      status: error?.status,
      code: error?.code,
    });
    throw error;
  }
}

export default { getGeminiClient, generateWithGemini, generateWithGeminiStream };