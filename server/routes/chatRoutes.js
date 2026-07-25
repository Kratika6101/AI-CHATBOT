import { Router } from 'express';
import { handleChat } from '../controllers/chatController.js';
import { validateMessage } from '../middleware/validation.js';

const router = Router();

router.post('/', validateMessage, handleChat);

router.get('/history/:sessionId?', (req, res) => {
  const { sessionId } = req.params;
  const { getHistory } = require('../services/conversationStore.js');
  const history = getHistory(sessionId);
  res.status(200).json({ history, sessionId: sessionId || 'default' });
});

router.delete('/history/:sessionId?', (req, res) => {
  const { sessionId } = req.params;
  const { clearConversation } = require('../services/conversationStore.js');
  clearConversation(sessionId);
  res.status(200).json({ message: 'History cleared.' });
});

export default router;