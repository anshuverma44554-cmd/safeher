import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { db, Journey } from '../db/database.js';

const startJourneySchema = z.object({
  start_location_name: z.string().min(2),
  start_lat: z.number(),
  start_lng: z.number(),
  destination_name: z.string().min(2),
  dest_lat: z.number(),
  dest_lng: z.number(),
  expected_arrival_time: z.string(), // ISO String
  battery_level: z.number().optional(),
});

export async function startJourney(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const data = startJourneySchema.parse(req.body);

  // Mark any prior active journey for this user as cancelled/completed
  db.journeys.forEach(j => {
    if (j.traveller_id === user.id && j.status === 'active') {
      j.status = 'cancelled';
      j.updated_at = new Date().toISOString();
    }
  });

  const shareToken = 'SH-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
  const journeyId = 'jny_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

  const newJourney: Journey = {
    id: journeyId,
    traveller_id: user.id,
    start_location_name: data.start_location_name,
    start_lat: data.start_lat,
    start_lng: data.start_lng,
    destination_name: data.destination_name,
    dest_lat: data.dest_lat,
    dest_lng: data.dest_lng,
    status: 'active',
    share_token: shareToken,
    expected_arrival_time: data.expected_arrival_time,
    last_lat: data.start_lat,
    last_lng: data.start_lng,
    last_updated: new Date().toISOString(),
    battery_level: data.battery_level,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.journeys.unshift(newJourney);

  // Notify configured trusted contacts
  const contacts = db.contacts.filter(c => c.traveller_id === user.id && c.notify_on_journey);
  contacts.forEach(c => {
    db.createNotification(
      user.id,
      'journey_started',
      'Journey Shared with ' + c.name,
      `${user.full_name} started traveling to ${data.destination_name}. Tracking link dispatched to ${c.phone}.`,
      { journeyId, shareToken }
    );
  });

  db.save();
  db.logActivity(user.id, 'JOURNEY_STARTED', { journeyId, destination: data.destination_name });

  res.status(201).json({
    success: true,
    journey: newJourney,
    trackingUrl: `/track/${shareToken}`,
    message: 'Journey started. Live location updates enabled.'
  });
}

export async function updateJourneyLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { latitude, longitude, battery_level } = req.body;

  const journey = db.journeys.find(j => j.id === id);
  if (!journey) {
    res.status(404).json({ success: false, error: 'Journey not found' });
    return;
  }

  if (journey.status !== 'active') {
    res.status(400).json({ success: false, error: 'Journey is no longer active' });
    return;
  }

  journey.last_lat = latitude;
  journey.last_lng = longitude;
  journey.last_updated = new Date().toISOString();
  if (battery_level !== undefined) {
    journey.battery_level = battery_level;
  }
  journey.updated_at = new Date().toISOString();

  db.save();

  res.json({ success: true, updated_at: journey.last_updated });
}

export async function endJourney(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const user = req.user!;

  const journey = db.journeys.find(j => j.id === id && j.traveller_id === user.id);
  if (!journey) {
    res.status(404).json({ success: false, error: 'Journey not found' });
    return;
  }

  journey.status = 'completed';
  journey.actual_arrival_time = new Date().toISOString();
  journey.updated_at = new Date().toISOString();

  // Notify trusted contacts of safe arrival
  const contacts = db.contacts.filter(c => c.traveller_id === user.id && c.notify_on_journey);
  contacts.forEach(c => {
    db.createNotification(
      user.id,
      'journey_arrived',
      'Safe Arrival Confirmed',
      `${user.full_name} has safely arrived at ${journey.destination_name}.`,
      { journeyId: journey.id }
    );
  });

  db.save();
  db.logActivity(user.id, 'JOURNEY_COMPLETED', { journeyId: journey.id });

  res.json({
    success: true,
    journey,
    message: 'Safe arrival recorded! Journey ended successfully.'
  });
}

export async function getActiveJourney(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const journey = db.journeys.find(j => j.traveller_id === user.id && j.status === 'active');

  res.json({
    success: true,
    active: Boolean(journey),
    journey: journey || null,
    trackingUrl: journey ? `/track/${journey.share_token}` : null
  });
}

export async function getSharedJourney(req: Request, res: Response): Promise<void> {
  const { shareToken } = req.params;

  const journey = db.journeys.find(j => j.share_token.toUpperCase() === shareToken.toUpperCase());
  if (!journey) {
    res.status(404).json({ success: false, error: 'Shared journey not found or link expired.' });
    return;
  }

  const traveller = db.profiles.find(p => p.id === journey.traveller_id);

  res.json({
    success: true,
    journey: {
      ...journey,
      traveller_name: traveller?.full_name || 'Solo Traveller',
      traveller_avatar: traveller?.avatar_url,
      emergency_notes: traveller?.emergency_notes
    }
  });
}

export async function getJourneyHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user!;
  const userJourneys = db.journeys
    .filter(j => j.traveller_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    success: true,
    journeys: userJourneys
  });
}

