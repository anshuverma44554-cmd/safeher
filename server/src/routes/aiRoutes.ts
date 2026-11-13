import { Router } from 'express';
import { chatWithAi, getQuickPhrases } from '../controllers/aiController.js';

const router = Router();

// Handle both /api/chat and /api/ai/chat
router.post('/', chatWithAi);
router.post('/chat', chatWithAi);

// Multilingual Emergency Phrasebook
router.get('/quick-phrase', getQuickPhrases);
router.get('/quick-phrases', getQuickPhrases);

export default router;

