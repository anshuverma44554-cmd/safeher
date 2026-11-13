import { Router } from 'express';
import { chatWithAi, getQuickPhrases } from '../controllers/aiController.js';

const router = Router();

router.post('/chat', chatWithAi);
router.get('/quick-phrase', getQuickPhrases);

export default router;

