import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import {
  SEED_PROFILES,
  SEED_GUARDIANS,
  SEED_CONTACTS,
  SEED_SAFE_PLACES,
  SEED_JOURNEYS
} from './seedData.js';

export interface Profile {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string;
  role: 'traveller' | 'guardian' | 'admin';
  avatar_url?: string;
  emergency_notes?: string;
  blood_group?: string;
  created_at: string;
  updated_at: string;
}

export interface GuardianProfile {
  id: string;
  user_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface EmergencyRequest {
  id: string;
  traveller_id: string;
  status: 'created' | 'notified' | 'accepted' | 'responding' | 'resolved' | 'cancelled';
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
  activity_log?: Array<{
    timestamp: string;
    action: string;
    actor: string;
    details?: string;
  }>;
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
  updated_at: string;
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
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

class HybridDatabase {
  private dataDir: string;
  private storeFilePath: string;
  public supabase: SupabaseClient | null = null;

  public profiles: Profile[] = [];
  public guardians: GuardianProfile[] = [];
  public contacts: TrustedContact[] = [];
  public journeys: Journey[] = [];
  public emergencies: EmergencyRequest[] = [];
  public safePlaces: SafePlace[] = [];
  public logs: ActivityLog[] = [];
  public notifications: AppNotification[] = [];

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.storeFilePath = path.join(this.dataDir, 'store.json');
    this.initDatabase();
  }

  private initDatabase() {
    if (config.supabase.isConfigured) {
      try {
        this.supabase = createClient(
          config.supabase.url,
          config.supabase.serviceRoleKey || config.supabase.anonKey
        );
        console.log('[SafeHer DB] Supabase client initialized.');
      } catch (err) {
        console.warn('[SafeHer DB] Supabase init failed, using resilient local store:', err);
      }
    }

    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        // fallback
      }
    }

    // Load from local store file or initialize with seed data
    if (fs.existsSync(this.storeFilePath)) {
      try {
        const raw = fs.readFileSync(this.storeFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.profiles = parsed.profiles || [];
        this.guardians = parsed.guardians || [];
        this.contacts = parsed.contacts || [];
        this.journeys = parsed.journeys || [];
        this.emergencies = parsed.emergencies || [];
        this.safePlaces = parsed.safePlaces || [];
        this.logs = parsed.logs || [];
        this.notifications = parsed.notifications || [];
        console.log('[SafeHer DB] Loaded data from local store.');
        return;
      } catch (err) {
        console.warn('[SafeHer DB] Failed to parse local store, re-seeding...');
      }
    }

    // Seed defaults
    this.profiles = [...SEED_PROFILES];
    this.guardians = [...SEED_GUARDIANS];
    this.contacts = [...SEED_CONTACTS];
    this.safePlaces = [...SEED_SAFE_PLACES];
    this.journeys = [...SEED_JOURNEYS];
    this.save();
    console.log('[SafeHer DB] Seeded fresh in-memory & local store.');
  }

  public save() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const snapshot = {
        profiles: this.profiles,
        guardians: this.guardians,
        contacts: this.contacts,
        journeys: this.journeys,
        emergencies: this.emergencies,
        safePlaces: this.safePlaces,
        logs: this.logs,
        notifications: this.notifications,
      };
      fs.writeFileSync(this.storeFilePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (err) {
      console.error('[SafeHer DB] Failed to write local store:', err);
    }
  }

  public logActivity(userId: string | undefined, action: string, details?: Record<string, any>, ip?: string) {
    const entry: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      action,
      ip_address: ip,
      details,
      created_at: new Date().toISOString()
    };
    this.logs.unshift(entry);
    if (this.logs.length > 500) this.logs.pop();
    this.save();
    return entry;
  }

  public createNotification(userId: string, type: string, title: string, message: string, data?: Record<string, any>) {
    const notif: AppNotification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      type,
      title,
      message,
      data,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.save();
    return notif;
  }
}

export const db = new HybridDatabase();

