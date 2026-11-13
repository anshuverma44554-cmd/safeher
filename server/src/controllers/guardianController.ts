import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { db, GuardianProfile } from '../db/database.js';
import { calculateDistanceKm, estimateWalkingTimeMins } from '../services/locationService.js';

const applyGuardianSchema = z.object({
  bio: z.string().min(10, 'Please provide a descriptive bio (at least 10 characters)'),
  languages: z.array(z.string()).min(1, 'Please specify at least 1 language'),
  address: z.string().min(5, 'Residential or business address required'),
  city: z.string().min(2, 'City required'),
  identification_type: z.string().min(2, 'Identification document type required'),
  id_document_url: z.string().url().or(z.string().min(5)),
  emergency_phone: z.string().min(6, 'Emergency direct contact phone number required'),
});

export async function getNearbyGuardians(req: AuthenticatedRequest, res: Response): Promise<void> {
  const lat = parseFloat(req.query.lat as string) || 28.6315;
  const lng = parseFloat(req.query.lng as string) || 77.2167;
  const radius = parseFloat(req.query.radius as string) || 15; // default 15 km

  // Only verified and available guardians are returned for safety
  const results: any[] = [];

  db.guardians.forEach(guardian => {
    if (guardian.verification_status === 'verified' && guardian.is_available && guardian.current_lat && guardian.current_lng) {
      const dist = calculateDistanceKm(lat, lng, guardian.current_lat, guardian.current_lng);
      if (dist <= radius) {
        const user = db.profiles.find(p => p.id === guardian.user_id);
        results.push({
          id: guardian.id,
          user_id: guardian.user_id,
          full_name: user?.full_name || 'Verified Community Guardian',
          avatar_url: user?.avatar_url,
          bio: guardian.bio,
          languages: guardian.languages,
          city: guardian.city,
          rating: guardian.rating,
          total_assists: guardian.total_assists,
          distance_km: dist,
          eta_mins: estimateWalkingTimeMins(dist),
          is_available: guardian.is_available,
          latitude: guardian.current_lat,
          longitude: guardian.current_lng,
        });
      }
    }
  });

  results.sort((a, b) => a.distance_km - b.distance_km);

  res.json({
    success: true,
    count: results.length,
    guardians: results
  });
}

export async function applyGuardian(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const data = applyGuardianSchema.parse(req.body);

  let guardian = db.guardians.find(g => g.user_id === user.id);

  if (guardian && guardian.verification_status === 'verified') {
    res.status(400).json({ success: false, error: 'You are already a verified guardian.' });
    return;
  }

  if (guardian) {
    guardian.bio = data.bio;
    guardian.languages = data.languages;
    guardian.address = data.address;
    guardian.city = data.city;
    guardian.identification_type = data.identification_type;
    guardian.id_document_url = data.id_document_url;
    guardian.emergency_phone = data.emergency_phone;
    guardian.verification_status = 'pending'; // Reset to pending for admin re-review
    guardian.updated_at = new Date().toISOString();
  } else {
    guardian = {
      id: 'grd_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: user.id,
      bio: data.bio,
      languages: data.languages,
      address: data.address,
      city: data.city,
      identification_type: data.identification_type,
      id_document_url: data.id_document_url,
      verification_status: 'pending',
      is_available: false,
      rating: 5.0,
      total_assists: 0,
      emergency_phone: data.emergency_phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.guardians.push(guardian);
  }

  // Upgrade profile role to guardian
  user.role = 'guardian';
  user.updated_at = new Date().toISOString();
  db.save();

  db.logActivity(user.id, 'GUARDIAN_APPLICATION_SUBMITTED', { city: data.city, idType: data.identification_type });

  // Alert Admins
  const admins = db.profiles.filter(p => p.role === 'admin');
  admins.forEach(admin => {
    db.createNotification(
      admin.id,
      'guardian_application',
      'New Guardian Application Submitted',
      `${user.full_name} has applied for Guardian verification in ${data.city}.`,
      { guardianId: guardian!.id, applicantId: user.id }
    );
  });

  res.status(200).json({
    success: true,
    guardian,
    message: 'Application submitted successfully. It is now awaiting SafeHer Admin document verification.'
  });
}

export async function getMyGuardianProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const guardian = db.guardians.find(g => g.user_id === user.id);

  if (!guardian) {
    res.status(404).json({ success: false, error: 'Guardian profile not found for this user.' });
    return;
  }

  res.json({
    success: true,
    guardian: {
      ...guardian,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url
    }
  });
}

export async function toggleAvailability(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const guardian = db.guardians.find(g => g.user_id === user.id);

  if (!guardian) {
    res.status(404).json({ success: false, error: 'Guardian profile not found.' });
    return;
  }

  if (guardian.verification_status !== 'verified') {
    res.status(403).json({
      success: false,
      error: 'Only admin-verified guardians can toggle availability to receive emergency alerts. Your verification status is: ' + guardian.verification_status
    });
    return;
  }

  const { is_available, latitude, longitude } = req.body;
  guardian.is_available = typeof is_available === 'boolean' ? is_available : !guardian.is_available;
  if (latitude !== undefined && longitude !== undefined) {
    guardian.current_lat = latitude;
    guardian.current_lng = longitude;
  }
  guardian.updated_at = new Date().toISOString();
  db.save();

  db.logActivity(user.id, 'GUARDIAN_AVAILABILITY_TOGGLED', { is_available: guardian.is_available });

  res.json({
    success: true,
    is_available: guardian.is_available,
    message: guardian.is_available ? 'You are now ON DUTY and available for emergency response.' : 'You are now OFF DUTY.'
  });
}

export async function getAssistanceRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const guardian = db.guardians.find(g => g.user_id === user.id);

  if (!guardian) {
    res.status(404).json({ success: false, error: 'Guardian profile not found.' });
    return;
  }

  // Active emergencies that are either assigned to this guardian OR waiting for response within guardian radius
  const emergencies = db.emergencies.filter(e => {
    if (['resolved', 'cancelled'].includes(e.status)) return false;
    if (e.assigned_guardian_id === guardian.id) return true;
    if (!e.assigned_guardian_id && guardian.is_available && guardian.current_lat && guardian.current_lng) {
      const dist = calculateDistanceKm(guardian.current_lat, guardian.current_lng, e.latitude, e.longitude);
      return dist <= 20; // within 20 km
    }
    return false;
  });

  const enriched = emergencies.map(e => {
    const traveller = db.profiles.find(p => p.id === e.traveller_id);
    const dist = guardian.current_lat && guardian.current_lng
      ? calculateDistanceKm(guardian.current_lat, guardian.current_lng, e.latitude, e.longitude)
      : null;
    return {
      ...e,
      traveller_name: traveller?.full_name || 'Solo Traveller',
      traveller_phone: traveller?.phone,
      blood_group: traveller?.blood_group,
      emergency_notes: traveller?.emergency_notes,
      distance_km: dist,
      eta_mins: dist ? estimateWalkingTimeMins(dist) : null,
    };
  });

  res.json({
    success: true,
    requests: enriched
  });
}

