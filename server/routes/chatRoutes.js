import { Router } from 'express';
import { handleChat } from '../controllers/chatController.js';
import { validateMessage } from '../middleware/validation.js';
import { getHistory, clearConversation } from '../services/conversationStore.js';

const router = Router();

router.post('/', validateMessage, handleChat);

router.get('/history/:sessionId?', (req, res) => {
  const { sessionId } = req.params;
  const history = getHistory(sessionId);
  res.status(200).json({ history, sessionId: sessionId || 'default' });
});

router.delete('/history/:sessionId?', (req, res) => {
  const { sessionId } = req.params;
  clearConversation(sessionId);
  res.status(200).json({ message: 'History cleared.' });
});

export default router;