import { Router } from 'express';
import { getNearbySafePlaces, addSafePlace } from '../controllers/safePlaceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/nearby', getNearbySafePlaces);
router.post('/', authenticate, addSafePlace);

export default router;

