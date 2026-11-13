import { Request, Response } from 'express';
import { z } from 'zod';
import { db, SafePlace } from '../db/database.js';
import { calculateDistanceKm } from '../services/locationService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const addSafePlaceSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['police', 'hospital', 'pharmacy', 'public_shelter', '24h_cafe', 'transit_hub']),
  address: z.string().min(5),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().optional(),
  open_hours: z.string().default('24/7'),
  description: z.string().optional(),
});

export async function getNearbySafePlaces(req: Request, res: Response): Promise<void> {
  const lat = parseFloat(req.query.lat as string) || 28.6315;
  const lng = parseFloat(req.query.lng as string) || 77.2167;
  const category = req.query.category as string;
  const radius = parseFloat(req.query.radius as string) || 25; // default 25km radius

  let places = db.safePlaces;
  if (category && category !== 'all') {
    places = places.filter(p => p.category === category);
  }

  const enriched = places.map(p => {
    const dist = calculateDistanceKm(lat, lng, p.latitude, p.longitude);
    return {
      ...p,
      distance_km: dist
    };
  }).filter(p => p.distance_km <= radius);

  enriched.sort((a, b) => a.distance_km - b.distance_km);

  res.json({
    success: true,
    count: enriched.length,
    places: enriched
  });
}

export async function addSafePlace(req: AuthenticatedRequest, res: Response): Promise<void> {
  const data = addSafePlaceSchema.parse(req.body);

  const newPlace: SafePlace = {
    id: 'sp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: data.name,
    category: data.category,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    phone: data.phone || '112',
    open_hours: data.open_hours,
    is_verified: true,
    rating: 5.0,
    description: data.description,
    created_at: new Date().toISOString()
  };

  db.safePlaces.push(newPlace);
  db.save();

  res.status(201).json({
    success: true,
    place: newPlace,
    message: 'Safe place verified and added to directory.'
  });
}

