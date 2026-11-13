-- ====================================================================
-- SafeHer - Seed Data for Hackathon / Production Demo
-- ====================================================================

-- Demo User Accounts
-- Password for all demo accounts: SafeHer@2026 (hashed with bcrypt 10 rounds: $2a$10$w8.m2J7dJm4kZ6XpWbB8u.4zN6pS7hF1xL0dD4y3nK0vO6iN2yU4q)
INSERT INTO profiles (id, email, full_name, phone, role, avatar_url, emergency_notes, blood_group) VALUES
('11111111-1111-1111-1111-111111111111', 'traveller@safeher.org', 'Priya Sharma', '+91 98765 43210', 'traveller', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Asthma inhaler in backpack side pouch', 'O+'),
('22222222-2222-2222-2222-222222222222', 'guardian@safeher.org', 'Sunita Rao', '+91 98111 22334', 'guardian', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Certified First Responder & Local Business Owner', 'B+'),
('33333333-3333-3333-3333-333333333333', 'guardian2@safeher.org', 'Ananya Verma', '+91 98222 33445', 'guardian', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Delhi University Professor & Safety Advocate', 'A+'),
('44444444-4444-4444-4444-444444444444', 'admin@safeher.org', 'SafeHer Admin Team', '+91 11 2345 6789', 'admin', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Head of Trust & Safety Operations', 'AB+');

-- Guardian Profiles
INSERT INTO guardian_profiles (id, user_id, bio, languages, address, city, identification_type, id_document_url, verification_status, is_available, current_lat, current_lng, rating, total_assists, emergency_phone) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Registered Community Guardian & Red Cross Certified in Emergency First Aid. Active in Central Delhi.', ARRAY['English', 'Hindi', 'Punjabi'], 'Block B, Connaught Place', 'New Delhi', 'National Identity Card (Aadhaar/Voter)', 'https://safeher.org/docs/verification/sunita_id_redacted.pdf', 'verified', true, 28.6315, 77.2167, 4.98, 38, '+91 98111 22334'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Faculty Member at University Campus. Experienced with student welfare & night safety coordination.', ARRAY['English', 'Hindi'], 'South Extension Part II', 'New Delhi', 'Passport & University Faculty ID', 'https://safeher.org/docs/verification/ananya_faculty_id.pdf', 'pending', false, 28.5701, 77.2215, 5.00, 0, '+91 98222 33445');

-- Trusted Contacts for Priya Sharma
INSERT INTO trusted_contacts (id, traveller_id, name, relationship, phone, email, is_primary, notify_on_sos, notify_on_journey) VALUES
('tc111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Kavita Sharma', 'Mother', '+91 98765 00001', 'kavita.sharma@example.com', true, true, true),
('tc222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Rohan Sharma', 'Brother', '+91 98765 00002', 'rohan.sharma@example.com', false, true, true),
('tc333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Neha Gupta', 'Best Friend / Colleague', '+91 98765 00003', 'neha.gupta@example.com', false, true, false);

-- Safe Places (Police Stations, Hospitals, 24/7 Pharmacies, Transit Hubs)
INSERT INTO safe_places (id, name, category, address, latitude, longitude, phone, open_hours, is_verified, rating) VALUES
('sp111111-1111-1111-1111-111111111111', 'Connaught Place Women Special Police Assistance Booth', 'police', 'Outer Circle, Near Rajiv Chowk Gate 2, New Delhi', 28.6328, 77.2195, '112 / 1091 (Women Helpline)', '24/7 Open', true, 4.9),
('sp222222-2222-2222-2222-222222222222', 'Dr. Ram Manohar Lohia Hospital (Emergency Trauma Wing)', 'hospital', 'Baba Kharak Singh Marg, New Delhi', 28.6247, 77.2023, '+91 11 2336 5525', '24/7 Emergency', true, 4.8),
('sp333333-3333-3333-3333-333333333333', 'Apollo 24/7 Pharmacy & Wellness Hub', 'pharmacy', 'Radial Road 4, Connaught Circus, New Delhi', 28.6300, 77.2180, '+91 11 2341 8900', '24/7 Open', true, 4.7),
('sp444444-4444-4444-4444-444444444444', 'Rajiv Chowk Metro Station Safe Assistance Center', 'transit_hub', 'Rajiv Chowk Metro Interchange, New Delhi', 28.6329, 77.2192, '+91 11 2341 7910', '05:30 AM - 11:30 PM', true, 4.9),
('sp555555-5555-5555-5555-555555555555', 'Barista 24/7 Safe Haven Cafe', '24h_cafe', 'M-Block, Outer Circle, Connaught Place', 28.6335, 77.2210, '+91 11 4151 7700', '24/7 Safe Space', true, 4.6),
('sp666666-6666-6666-6666-666666666666', 'Parliament Street Police Station', 'police', 'Parliament Street, New Delhi', 28.6231, 77.2144, '+91 11 2374 6100', '24/7 Open', true, 4.8);

-- Seed Journey
INSERT INTO journeys (id, traveller_id, start_location_name, start_lat, start_lng, destination_name, dest_lat, dest_lng, status, share_token, expected_arrival_time) VALUES
('j1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Connaught Place Inner Circle', 28.6315, 77.2167, 'India Gate Central Lawns', 28.6129, 77.2295, 'active', 'SAFE-TRACK-DELHI-9842', NOW() + INTERVAL '35 minutes');

