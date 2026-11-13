import { Router } from 'express';
import {
  getNearbyGuardians,
  applyGuardian,
  getMyGuardianProfile,
  toggleAvailability,
  getAssistanceRequests
} from '../controllers/guardianController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/nearby', getNearbyGuardians);
router.post('/apply', authenticate, applyGuardian);
router.get('/me', authenticate, getMyGuardianProfile);
router.patch('/availability', authenticate, toggleAvailability);
router.get('/requests', authenticate, getAssistanceRequests);

export default router;

