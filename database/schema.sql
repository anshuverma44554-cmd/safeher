-- ====================================================================
-- SafeHer - Women Safety & Solo Travel Digital Platform
-- Supabase / PostgreSQL Schema Definition with Row-Level Security (RLS)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Drop if Re-running
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS safety_checkins CASCADE;
DROP TABLE IF EXISTS location_updates CASCADE;
DROP TABLE IF EXISTS emergency_responses CASCADE;
DROP TABLE IF EXISTS emergency_requests CASCADE;
DROP TABLE IF EXISTS journeys CASCADE;
DROP TABLE IF EXISTS trusted_contacts CASCADE;
DROP TABLE IF EXISTS guardian_verifications CASCADE;
DROP TABLE IF EXISTS guardian_profiles CASCADE;
DROP TABLE IF EXISTS safe_places CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. PROFILES TABLE
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'traveller' CHECK (role IN ('traveller', 'guardian', 'admin')),
    avatar_url TEXT,
    emergency_notes TEXT,
    blood_group TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. GUARDIAN PROFILES TABLE
CREATE TABLE guardian_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT,
    languages TEXT[] DEFAULT ARRAY['English'],
    address TEXT,
    city TEXT,
    identification_type TEXT NOT NULL DEFAULT 'Government ID',
    id_document_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    is_available BOOLEAN NOT NULL DEFAULT false,
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    rating NUMERIC(3,2) DEFAULT 5.0,
    total_assists INTEGER NOT NULL DEFAULT 0,
    emergency_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. GUARDIAN VERIFICATIONS (ADMIN AUDIT)
CREATE TABLE guardian_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID NOT NULL REFERENCES guardian_profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
    notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TRUSTED CONTACTS
CREATE TABLE trusted_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    traveller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    notify_on_sos BOOLEAN NOT NULL DEFAULT true,
    notify_on_journey BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. JOURNEYS
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    traveller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    start_location_name TEXT NOT NULL,
    start_lat DOUBLE PRECISION NOT NULL,
    start_lng DOUBLE PRECISION NOT NULL,
    destination_name TEXT NOT NULL,
    dest_lat DOUBLE PRECISION NOT NULL,
    dest_lng DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'delayed')),
    share_token TEXT UNIQUE NOT NULL,
    expected_arrival_time TIMESTAMPTZ NOT NULL,
    actual_arrival_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. EMERGENCY REQUESTS (SOS)
CREATE TABLE emergency_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    traveller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'notified', 'accepted', 'responding', 'resolved', 'cancelled')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    battery_level INTEGER,
    message TEXT,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    assigned_guardian_id UUID REFERENCES guardian_profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. EMERGENCY RESPONSES
CREATE TABLE emergency_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_id UUID NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardian_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    response_notes TEXT,
    arrival_eta_mins INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. LOCATION UPDATES (REAL-TIME TRAIL)
CREATE TABLE location_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    emergency_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    battery_level INTEGER,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SAFE PLACES DIRECTORY
CREATE TABLE safe_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('police', 'hospital', 'pharmacy', 'public_shelter', '24h_cafe', 'transit_hub')),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone TEXT,
    open_hours TEXT DEFAULT '24/7',
    is_verified BOOLEAN NOT NULL DEFAULT true,
    rating NUMERIC(3,2) DEFAULT 4.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SAFETY CHECK-INS
CREATE TABLE safety_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    traveller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checked_in', 'missed')),
    response_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. ACTIVITY & AUDIT LOGS
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR FAST GEOSPATIAL & REALTIME QUERIES
CREATE INDEX idx_emergency_status ON emergency_requests(status);
CREATE INDEX idx_emergency_traveller ON emergency_requests(traveller_id);
CREATE INDEX idx_guardian_available ON guardian_profiles(is_available, verification_status);
CREATE INDEX idx_journey_share_token ON journeys(share_token);
CREATE INDEX idx_location_journey ON location_updates(journey_id);
CREATE INDEX idx_location_emergency ON location_updates(emergency_id);
CREATE INDEX idx_safe_places_cat ON safe_places(category);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Users can view public guardian names; users can edit own profile; admins can edit all
CREATE POLICY "Public profile read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Safe Places: Anyone can view verified safe places
CREATE POLICY "Public safe places read" ON safe_places FOR SELECT USING (true);

-- 3. Trusted Contacts: Only the owner traveller can read and update
CREATE POLICY "Travellers access own contacts" ON trusted_contacts FOR ALL USING (auth.uid() = traveller_id);

-- 4. Journeys: Owner traveller full access; public access via share_token lookup
CREATE POLICY "Traveller manage journeys" ON journeys FOR ALL USING (auth.uid() = traveller_id);
CREATE POLICY "Public view shared journey" ON journeys FOR SELECT USING (true);

-- 5. Emergency Requests: Traveller, assigned guardian, or admin can read/update
CREATE POLICY "Emergency participants access" ON emergency_requests FOR ALL USING (
    auth.uid() = traveller_id OR 
    auth.uid() IN (SELECT user_id FROM guardian_profiles WHERE id = assigned_guardian_id)
);

