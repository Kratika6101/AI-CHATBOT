import { GoogleGenerativeAI } from '@google/generative-ai';

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
    console.log(`[Gemini] Chat model ${modelName} with ${history.length} history items`);

    const chat = model.startChat({ history });
    const lastUser = messages[messages.length - 1];
    const userText = lastUser?.content || 'Hello';
    const result = await chat.sendMessage(userText);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      console.warn('[Gemini] Empty response received');
      return 'I received an empty response. Please try again.';
    }

    console.log(`[Gemini] Success. Response length: ${text.length}`);
    return text.trim();
  } catch (error) {
    console.error('[Gemini] API call failed:', {
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
    console.log(`[Gemini] Streaming chat model ${modelName} with ${history.length} history items`);
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
      console.warn('[Gemini] Stream yielded no content');
      yield 'I received an empty response. Please try again.';
    }
  } catch (error) {
    console.error('[Gemini] Stream failed:', {
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