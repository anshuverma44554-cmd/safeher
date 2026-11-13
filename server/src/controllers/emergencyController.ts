import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { emergencyService } from '../services/emergencyService.js';
import { db } from '../db/database.js';

const createEmergencySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  message: z.string().optional(),
});

export async function createEmergency(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const data = createEmergencySchema.parse(req.body);

  const result = emergencyService.createEmergency({
    travellerId: user.id,
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    batteryLevel: data.batteryLevel,
    message: data.message,
  });

  res.status(201).json({
    success: true,
    emergency: result.emergency,
    notifiedContactsCount: result.notifiedContactsCount,
    notifiedGuardiansCount: result.notifiedGuardiansCount,
    message: 'Distress Beacon broadcasted successfully.'
  });
}

export async function getActiveEmergency(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;

  // Look for active emergency created by traveller OR assigned to guardian
  let active = db.emergencies.find(
    e => e.traveller_id === user.id && !['resolved', 'cancelled'].includes(e.status)
  );

  // If user is a guardian, check if they have accepted an emergency
  if (!active && user.role === 'guardian') {
    const guardian = db.guardians.find(g => g.user_id === user.id);
    if (guardian) {
      active = db.emergencies.find(
        e => e.assigned_guardian_id === guardian.id && !['resolved', 'cancelled'].includes(e.status)
      );
    }
  }

  if (!active) {
    res.json({ success: true, active: false, emergency: null });
    return;
  }

  const traveller = db.profiles.find(p => p.id === active.traveller_id);
  const assignedGuardian = active.assigned_guardian_id
    ? db.guardians.find(g => g.id === active.assigned_guardian_id)
    : null;
  const guardianUser = assignedGuardian
    ? db.profiles.find(p => p.id === assignedGuardian.user_id)
    : null;

  res.json({
    success: true,
    active: true,
    emergency: active,
    traveller: traveller ? { full_name: traveller.full_name, phone: traveller.phone, blood_group: traveller.blood_group, emergency_notes: traveller.emergency_notes } : null,
    guardian: assignedGuardian ? { ...assignedGuardian, full_name: guardianUser?.full_name } : null
  });
}

export async function getEmergencyById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const emergency = db.emergencies.find(e => e.id === id);

  if (!emergency) {
    res.status(404).json({ success: false, error: 'Emergency request not found' });
    return;
  }

  const traveller = db.profiles.find(p => p.id === emergency.traveller_id);
  const assignedGuardian = emergency.assigned_guardian_id
    ? db.guardians.find(g => g.id === emergency.assigned_guardian_id)
    : null;
  const guardianUser = assignedGuardian
    ? db.profiles.find(p => p.id === assignedGuardian.user_id)
    : null;

  res.json({
    success: true,
    emergency,
    traveller: traveller ? { full_name: traveller.full_name, phone: traveller.phone, blood_group: traveller.blood_group, emergency_notes: traveller.emergency_notes } : null,
    guardian: assignedGuardian ? { ...assignedGuardian, full_name: guardianUser?.full_name } : null
  });
}

export async function updateEmergencyStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!['responding', 'resolved', 'cancelled'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid status. Permitted: responding, resolved, cancelled' });
    return;
  }

  const user = req.user!;
  const updated = emergencyService.updateStatus(id, status, user.full_name, notes);

  if (!updated) {
    res.status(404).json({ success: false, error: 'Emergency request not found' });
    return;
  }

  res.json({
    success: true,
    emergency: updated,
    message: `Emergency marked as ${status}.`
  });
}

export async function respondToEmergency(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { action, notes } = req.body;

  if (!['accept', 'reject'].includes(action)) {
    res.status(400).json({ success: false, error: 'Action must be accept or reject' });
    return;
  }

  const user = req.user!;
  const result = emergencyService.guardianRespond({
    emergencyId: id,
    guardianUserId: user.id,
    action,
    notes
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
}

