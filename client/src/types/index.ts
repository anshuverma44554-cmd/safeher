export type UserRole = 'traveller' | 'guardian' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  emergency_notes?: string;
  blood_group?: string;
  created_at?: string;
}

export interface Guardian {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  bio: string;
  languages: string[];
  address: string;
  city: string;
  identification_type: string;
  id_document_url: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_available: boolean;
  current_lat?: number;
  current_lng?: number;
  rating: number;
  total_assists: number;
  emergency_phone: string;
  distance_km?: number;
  eta_mins?: number;
}

export type EmergencyStatus = 'created' | 'notified' | 'accepted' | 'responding' | 'resolved' | 'cancelled';

export interface EmergencyActivityLog {
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export interface Emergency {
  id: string;
  traveller_id: string;
  traveller_name?: string;
  traveller_phone?: string;
  status: EmergencyStatus;
  latitude: number;
  longitude: number;
  address?: string;
  battery_level?: number;
  message?: string;
  escalation_level: number;
  assigned_guardian_id?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  activity_log?: EmergencyActivityLog[];
}

export interface TrustedContact {
  id: string;
  traveller_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  notify_on_sos: boolean;
  notify_on_journey: boolean;
  created_at: string;
}

export interface Journey {
  id: string;
  traveller_id: string;
  traveller_name?: string;
  traveller_avatar?: string;
  start_location_name: string;
  start_lat: number;
  start_lng: number;
  destination_name: string;
  dest_lat: number;
  dest_lng: number;
  status: 'active' | 'completed' | 'cancelled' | 'delayed';
  share_token: string;
  expected_arrival_time: string;
  actual_arrival_time?: string;
  last_lat?: number;
  last_lng?: number;
  last_updated?: string;
  battery_level?: number;
  created_at: string;
}

export interface SafePlace {
  id: string;
  name: string;
  category: 'police' | 'hospital' | 'pharmacy' | 'public_shelter' | '24h_cafe' | 'transit_hub';
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  open_hours?: string;
  is_verified: boolean;
  rating: number;
  description?: string;
  distance_km?: number;
}

export interface AdminStats {
  totalUsers: number;
  travellersCount: number;
  verifiedGuardiansCount: number;
  pendingGuardianApplications: number;
  activeEmergencies: number;
  totalEmergencies: number;
  totalSafePlaces: number;
  activeJourneys: number;
}

