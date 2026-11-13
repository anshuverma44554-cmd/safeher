import dotenv from 'dotenv';
import path from 'path';

// Load .env from server root or project root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'safeher-super-secret-jwt-key-2026-production-ready',
  jwtExpiresIn: '7d',
  
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    isConfigured: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)),
  },

  // Google Gemini API Configuration
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    isConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
  },

  // Emergency SOS Configuration
  emergency: {
    autoEscalateTimeoutMs: 3 * 60 * 1000, // 3 minutes without guardian acceptance triggers escalation
    guardianRadiusKm: 15, // Guardians within 15 km are notified
  }
};

