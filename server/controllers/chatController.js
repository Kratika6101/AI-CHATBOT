import { generateReply, generateReplyStream } from '../services/chatService.js';
import { getConversation, getHistory, appendMessage } from '../services/conversationStore.js';
import { asyncHandler } from '../middleware/validation.js';

export const handleChat = asyncHandler(async (req, res) => {
  const { message, conversationHistory, stream, sessionId } = req.body;

  const effectiveSessionId = sessionId || `session_${Date.now()}`;

  if (message && typeof message === 'string' && message.trim().length > 0) {
    appendMessage(effectiveSessionId, 'user', message.trim());
  }

  const historyFromStore = getHistory(effectiveSessionId);

  const wantsStream = stream === true;

  if (wantsStream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      for await (const chunk of generateReplyStream({
        message: message || '',
        conversationHistory: historyFromStore,
      })) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      appendMessage(effectiveSessionId, 'assistant', '[streamed]');
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (streamError) {
      console.error('[ChatController] Streaming error:', streamError);
      if (!res.headersSent) {
        res.status(streamError?.status || 500).json({
          message: streamError?.message || 'Streaming failed.',
        });
      } else {
        res.write(`data: ${JSON.stringify({ error: streamError?.message || 'Streaming failed.' })}\n\n`);
        res.end();
      }
    }
    return;
  }

  try {
    const reply = await generateReply({
      message: message || '',
      conversationHistory: historyFromStore,
    });

    appendMessage(effectiveSessionId, 'assistant', reply);
    res.status(200).json({ reply, sessionId: effectiveSessionId });
  } catch (replyError) {
    console.error('[ChatController] Reply error:', replyError);
    throw replyError;
  }
});