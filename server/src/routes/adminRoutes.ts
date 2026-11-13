import { Router } from 'express';
import {
  getAdminStats,
  getAllGuardians,
  verifyGuardian,
  getAllEmergencies,
  getAllUsers,
  getActivityLogs
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect entire admin namespace
router.use(authenticate);
router.use(requireRole(['admin']));

router.get('/stats', getAdminStats);
router.get('/guardians', getAllGuardians);
router.patch('/guardians/:id/verify', verifyGuardian);
router.get('/emergencies', getAllEmergencies);
router.get('/users', getAllUsers);
router.get('/logs', getActivityLogs);

export default router;

