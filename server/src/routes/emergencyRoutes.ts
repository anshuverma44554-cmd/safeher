import { Router } from 'express';
import {
  createEmergency,
  getActiveEmergency,
  getEmergencyById,
  updateEmergencyStatus,
  respondToEmergency
} from '../controllers/emergencyController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/create', authenticate, createEmergency);
router.get('/active', authenticate, getActiveEmergency);
router.get('/:id', authenticate, getEmergencyById);
router.patch('/:id/status', authenticate, updateEmergencyStatus);
router.post('/:id/respond', authenticate, respondToEmergency);

export default router;

