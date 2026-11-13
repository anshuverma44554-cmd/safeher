import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../db/database.js';

export async function getAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  const totalUsers = db.profiles.length;
  const travellersCount = db.profiles.filter(p => p.role === 'traveller').length;
  const verifiedGuardiansCount = db.guardians.filter(g => g.verification_status === 'verified').length;
  const pendingGuardianApplications = db.guardians.filter(g => g.verification_status === 'pending').length;
  const activeEmergencies = db.emergencies.filter(e => !['resolved', 'cancelled'].includes(e.status)).length;
  const totalEmergencies = db.emergencies.length;
  const totalSafePlaces = db.safePlaces.length;

  res.json({
    success: true,
    stats: {
      totalUsers,
      travellersCount,
      verifiedGuardiansCount,
      pendingGuardianApplications,
      activeEmergencies,
      totalEmergencies,
      totalSafePlaces,
      activeJourneys: db.journeys.filter(j => j.status === 'active').length
    }
  });
}

export async function getAllGuardians(req: AuthenticatedRequest, res: Response): Promise<void> {
  const status = req.query.status as string; // 'pending' | 'verified' | 'rejected' | 'all'

  let guardians = db.guardians;
  if (status && status !== 'all') {
    guardians = guardians.filter(g => g.verification_status === status);
  }

  const enriched = guardians.map(g => {
    const user = db.profiles.find(p => p.id === g.user_id);
    return {
      ...g,
      full_name: user?.full_name || 'Guardian Applicant',
      email: user?.email,
      phone: user?.phone,
      avatar_url: user?.avatar_url,
    };
  });

  res.json({
    success: true,
    count: enriched.length,
    guardians: enriched
  });
}

const verifySchema = z.object({
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
});

export async function verifyGuardian(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const admin = req.user!;
  const data = verifySchema.parse(req.body);

  const guardian = db.guardians.find(g => g.id === id);
  if (!guardian) {
    res.status(404).json({ success: false, error: 'Guardian application not found.' });
    return;
  }

  guardian.verification_status = data.status === 'approved' ? 'verified' : 'rejected';
  if (data.status === 'approved') {
    guardian.is_available = true; // Make active upon approval
  } else {
    guardian.is_available = false;
  }
  guardian.updated_at = new Date().toISOString();

  const applicant = db.profiles.find(p => p.id === guardian.user_id);

  // Notify applicant of admin verdict
  db.createNotification(
    guardian.user_id,
    'guardian_verification',
    data.status === 'approved' ? '🎉 Congratulations! You are a Verified SafeHer Guardian' : 'Guardian Verification Notice',
    data.status === 'approved'
      ? 'Your identity documents have been approved by SafeHer Trust & Safety Operations. You can now toggle availability and protect travellers.'
      : `Your application could not be verified at this time. Notes: ${data.notes || 'Please resubmit valid government identification.'}`,
    { status: guardian.verification_status, notes: data.notes }
  );

  db.save();
  db.logActivity(admin.id, 'GUARDIAN_VERIFICATION_AUDIT', {
    guardianId: guardian.id,
    applicantId: guardian.user_id,
    verdict: data.status,
    notes: data.notes
  });

  res.json({
    success: true,
    guardian,
    applicant: applicant ? { full_name: applicant.full_name, email: applicant.email } : null,
    message: `Guardian application ${data.status === 'approved' ? 'APPROVED' : 'REJECTED'} successfully.`
  });
}

export async function getAllEmergencies(req: AuthenticatedRequest, res: Response): Promise<void> {
  const enriched = db.emergencies.map(e => {
    const traveller = db.profiles.find(p => p.id === e.traveller_id);
    const assignedGuardian = e.assigned_guardian_id ? db.guardians.find(g => g.id === e.assigned_guardian_id) : null;
    const guardianUser = assignedGuardian ? db.profiles.find(p => p.id === assignedGuardian.user_id) : null;
    return {
      ...e,
      traveller_name: traveller?.full_name || 'Solo Traveller',
      traveller_phone: traveller?.phone,
      guardian_name: guardianUser?.full_name || (assignedGuardian ? 'Guardian Assigned' : 'Unassigned'),
    };
  });

  res.json({
    success: true,
    emergencies: enriched
  });
}

export async function getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  const safeUsers = db.profiles.map(p => {
    const { password_hash: _, ...safe } = p;
    return safe;
  });

  res.json({
    success: true,
    users: safeUsers
  });
}

export async function getActivityLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const limit = parseInt(req.query.limit as string) || 50;
  const enrichedLogs = db.logs.slice(0, limit).map(l => {
    const user = l.user_id ? db.profiles.find(p => p.id === l.user_id) : null;
    return {
      ...l,
      user_name: user?.full_name || 'System / Guest'
    };
  });

  res.json({
    success: true,
    logs: enrichedLogs
  });
}

