import { Router } from 'express';
import {
  startJourney,
  updateJourneyLocation,
  endJourney,
  getActiveJourney,
  getSharedJourney,
  getJourneyHistory
} from '../controllers/journeyController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/start', authenticate, startJourney);
router.post('/:id/location', authenticate, updateJourneyLocation);
router.post('/:id/end', authenticate, endJourney);
router.get('/active', authenticate, getActiveJourney);
router.get('/history', authenticate, getJourneyHistory);
// Public track endpoint for family/friends via secret share token:
router.get('/track/:shareToken', getSharedJourney);

export default router;

