# 🛡️ SafeHer — Travel Freely. Stay Safely.

> **Category:** Women Safety | Solo Travel Safety | Smart Digital Ecosystem | Social Impact  
> **Tagline:** *"Travel Freely. Stay Safely."*

SafeHer is a comprehensive, women-first travel safety web application engineered to empower solo female travellers in unfamiliar cities. Rather than functioning as a passive siren or emergency alarm, SafeHer bridges the gap between travellers, admin-verified local community guardians, live journey tracking, 24/7 public safe havens, and Google Gemini AI safety guidance.

---

## 🚀 Key Features Built & Functional

### 1. 🚨 Smart Emergency SOS Interlock
- **3-Second Accidental Trigger Protection:** Prevents false alarms with a visible countdown timer and instant cancel mechanism.
- **Synthesized Audio Alarm:** Audio siren generator via the Web Audio API without requiring external MP3 assets.
- **Simultaneous Broadcast:** Immediately dispatches coordinates and battery percentage to trusted contacts and nearby verified guardians.
- **Escalation Protocol:** Automatically escalates emergency levels if an unassigned distress call is not acknowledged within the configured timeout window.
- **Direct 112 Hotline Shortcut:** One-tap calling to local official emergency authorities.

### 2. 📍 Live Location & Consent-Based Journey Sharing
- **Start / End Journey:** Set starting points, destinations, and estimated arrival times (ETA).
- **Public Shareable Link (`/track/:shareToken`):** Authorized family members can monitor live GPS coordinates, battery levels, and route progress without installing an app or registering.
- **Zero Hidden Background Tracking:** Transparent, strictly consent-based location updates while active.

### 3. 🛡️ Verified Local Guardian Network
- **Admin Verification Workflow:** Community members apply with identity proofs (National ID, Passport, Faculty/Work Badge).
- **Security Interlock:** Only admin-approved guardians can toggle availability ("On Duty" / "Off Duty") and receive distress beacon dispatches.
- **Interactive Rescue Interface:** Guardians view incoming SOS alerts with distance in km, walking ETA, traveller details, and status progression (`accepted` -> `responding` -> `resolved`).

### 4. 🗺️ Safe Place Finder (Leaflet & OpenStreetMap)
- **Interactive Visual Radar:** Displays verified 24/7 police assistance booths, trauma hospitals, late-night licensed pharmacies, and verified SafeHer partner cafes.
- **Filter & Search:** One-click filtering by category with distance calculations and direct helpline calling.

### 5. ✨ AI Safety Assistant (Google Gemini API)
- **Context-Aware Safety Advice:** Neighborhood risk assessments, night travel precautions, cab verification checklists, and hotel room security essentials.
- **Multilingual Emergency Phrasebook:** Instant localized translations with phonetic guides into **Hindi (हिंदी)**, **French (Français)**, and **Spanish (Español)**.
- **Emergency Priority Mode:** Toggle that focuses advice strictly on crisis evacuation and de-escalation.

### 6. ⏱️ Safety Arrival Timer
- Set 15m, 30m, or 45m check-in countdowns for short cab rides or late walks.
- Safe check-in confirmation with celebration visuals.
- Auto-escalation warnings if a check-in is missed.

### 7. 👥 Trusted Contacts Manager
- Add, update, and manage primary emergency contacts with notification toggles for SOS alerts and journey broadcasts.

### 8. ⚙️ Central Administrative Console
- **Platform Analytics:** Live metrics for total users, verified guardians, pending applications, active SOS alerts, and safe places.
- **Guardian Applications Queue:** Inspect applicant credentials and click **Approve** or **Reject** with immutable audit notes.
- **Global Emergency Monitor:** Real-time visibility into all active distress calls across the network.
- **Activity & Security Audit Trail:** Full event logging.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Leaflet, React-Leaflet, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, REST APIs, Helmet, CORS, JWT, BcryptJS, Zod Validation |
| **Database & Auth** | Supabase, PostgreSQL (with full RLS & SQL migrations), resilient built-in JSON/in-memory store fallback |
| **Artificial Intelligence** | Google Gemini API (`@google/generative-ai`) with offline safety engine fallback |
| **Geospatial & Maps** | Leaflet, OpenStreetMap, Haversine proximity formulas |

---

## ⚡ Instant 1-Click Demo Accounts

For instant testing and evaluation without manual signup, use the pre-configured accounts:

| Persona | Role | Email | Password | Details |
|---|---|---|---|---|
| **Priya Sharma** | `traveller` | `traveller@safeher.org` | `SafeHer@2026` | Solo traveller in New Delhi, active journey & contacts configured |
| **Sunita Rao** | `guardian` | `guardian@safeher.org` | `SafeHer@2026` | Verified community guardian, Red Cross certified, 4.98 rating |
| **Ananya Verma** | `guardian` | `guardian2@safeher.org` | `SafeHer@2026` | Guardian applicant in **Pending Verification Queue** |
| **SafeHer Operations** | `admin` | `admin@safeher.org` | `SafeHer@2026` | Access to verification queue, live SOS feed, and audit logs |

> **Tip:** You can also switch between these personas instantly using the **"Demo Personas"** dropdown in the navigation bar!

---

## 📦 Project Structure

```
safe-her/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Navbar, Footer, SafePlacesMap, LiveTrackerMap, AiDrawer, EmergencyModal
│   │   ├── context/            # AuthContext, EmergencyContext
│   │   ├── pages/              # Landing, Login, Register, TravellerDashboard, GuardianDashboard, AdminDashboard, PublicTracking, SafePlaces, AiSafety
│   │   ├── services/           # Typed API Client
│   │   └── types/              # Domain TypeScript interfaces
│   ├── index.html
│   └── tailwind.config.js      # SafeHer Purple, Lavender, Dark Navy & Emergency Red palette
├── server/                     # Express + TypeScript Backend API
│   ├── src/
│   │   ├── config/             # Environment validation
│   │   ├── controllers/        # Auth, Emergency, Guardian, Journey, SafePlaces, Contacts, AI, Admin
│   │   ├── db/                 # Database manager & initial seed data
│   │   ├── middleware/         # JWT Auth, Role-based Access Control, Central Error Handler
│   │   ├── routes/             # REST API Routes
│   │   ├── services/           # Emergency dispatch engine, Gemini AI service, Location service
│   │   └── server.ts           # Express server entry point
│   └── tsconfig.json
├── database/                   # PostgreSQL / Supabase Schema & Seed Files
│   ├── schema.sql              # 12 Tables, Foreign Keys, Indexes, Row-Level Security (RLS)
│   ├── seed.sql                # Seeded guardians, safe havens, travellers, and contacts
│   └── README.md               # Supabase migration instructions
├── .env.example                # Environment variable documentation
└── package.json                # Root orchestration scripts
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# In project root:
npm install

# In backend:
cd server && npm install

# In frontend:
cd ../client && npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

SafeHer runs **out-of-the-box immediately** with its built-in resilient hybrid store and expert safety AI engine even if external keys are left blank!

#### Optional External Keys:
1. **Google Gemini API:** Obtain a free key from [Google AI Studio](https://aistudio.google.com/app/apikey) and set `GEMINI_API_KEY`.
2. **Supabase Database:** Create a project at [Supabase](https://supabase.com), run `database/schema.sql` and `database/seed.sql` in the SQL Editor, and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 3. Run Development Servers
```bash
# Option A: Run both server & client simultaneously from root
npm run dev

# Option B: Run separately
# Terminal 1 (Backend on http://localhost:5000):
cd server && npm run dev

# Terminal 2 (Frontend on http://localhost:5173):
cd client && npm run dev
```

### 4. Build for Production
```bash
# Build both frontend and backend
npm run build
```

---

## 📄 API Endpoints Summary

- `POST /api/auth/register` — Register as traveller or apply as guardian
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET  /api/auth/me` — Current authenticated profile
- `POST /api/emergency/create` — Trigger distress beacon with GPS coordinates & battery level
- `GET  /api/emergency/active` — Current active emergency for user
- `PATCH /api/emergency/:id/status` — Update emergency status (`responding`, `resolved`, `cancelled`)
- `POST /api/emergency/:id/respond` — Guardian accepts or declines emergency
- `GET  /api/guardians/nearby` — Discover nearby verified & available guardians
- `POST /api/guardians/apply` — Submit guardian application with ID document proof
- `PATCH /api/guardians/availability` — Toggle guardian on-duty / off-duty status
- `POST /api/journey/start` — Start journey with destination, ETA & shareable token
- `GET  /api/journey/track/:shareToken` — Public live tracker for family/friends
- `POST /api/journey/:id/end` — Confirm safe arrival and end journey
- `GET  /api/safe-places/nearby` — Fetch verified police booths, hospitals, and pharmacies
- `POST /api/ai/chat` — Google Gemini AI travel safety conversation
- `GET  /api/ai/quick-phrase` — Localized emergency phrase translations
- `GET  /api/admin/stats` — High-level platform metrics
- `PATCH /api/admin/guardians/:id/verify` — Admin approves or rejects guardian applications

---

## 🔒 Security & Privacy Principles
1. **Consent-Driven Tracking:** Location is only broadcast during explicitly started journeys or activated SOS distress beacons.
2. **Strict Role-Based Authorization:** Guardian verification cannot be self-assigned; only authenticated administrators can approve guardian credentials.
3. **Emergency Interlock:** 3-second accidental trigger countdown prevents accidental false dispatches.
4. **Transparent Boundaries:** SafeHer explicitly highlights that community guardians and digital maps complement—rather than replace—official state police (112) services.

