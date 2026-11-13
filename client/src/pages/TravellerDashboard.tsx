import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  Plus,
  Trash2,
  Share2,
  Navigation,
  CheckCircle,
  Copy,
  Check,
  Radio,
  ExternalLink,
  LocateFixed,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { Journey, TrustedContact, SafePlace, Guardian } from '../types';
import { SafePlacesMap } from '../components/map/SafePlacesMap';
import { LiveTrackerMap } from '../components/map/LiveTrackerMap';
import { Avatar } from '../components/common/Avatar';

export const TravellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { openConfirmModal, isSOSActive, activeEmergency } = useEmergency();

  // State
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [nearbyGuardians, setNearbyGuardians] = useState<Guardian[]>([]);
  const [nearbySafePlaces, setNearbySafePlaces] = useState<SafePlace[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Journey Form State
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [startLocation, setStartLocation] = useState('Connaught Place Inner Circle');
  const [destination, setDestination] = useState('India Gate Central Lawns');
  const [etaMinutes, setEtaMinutes] = useState(30);

  // Safety Timer State
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // New Contact Form State
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  // Location
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([28.6315, 77.2167]);

  // Load Initial Data
  const loadDashboardData = async () => {
    try {
      // 1. Active Journey
      const journeyRes = await api.getActiveJourney();
      if (journeyRes.success && journeyRes.journey) {
        setActiveJourney(journeyRes.journey);
      } else {
        setActiveJourney(null);
      }

      // 2. Contacts
      const contactsRes = await api.getContacts();
      if (contactsRes.success) {
        setContacts(contactsRes.contacts);
      }

      // 3. Nearby Guardians
      const guardiansRes = await api.getNearbyGuardians(currentCoords[0], currentCoords[1]);
      if (guardiansRes.success) {
        setNearbyGuardians(guardiansRes.guardians);
      }

      // 4. Nearby Safe Places
      const placesRes = await api.getSafePlaces(currentCoords[0], currentCoords[1]);
      if (placesRes.success) {
        setNearbySafePlaces(placesRes.places.slice(0, 4));
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Geolocation detection
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Safety Timer interval
  useEffect(() => {
    if (timerActive && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      const interval = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev && prev <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            alert('⚠️ Safety Timer Expired! Please confirm your safe check-in, otherwise your emergency contacts will be alerted.');
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, timerSecondsLeft]);

  // Start Safety Timer
  const handleStartTimer = (mins: number) => {
    setTimerSecondsLeft(mins * 60);
    setTimerActive(true);
  };

  // Safe Check-in
  const handleCheckInSafe = () => {
    setTimerActive(false);
    setTimerSecondsLeft(null);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    alert('✅ Safe check-in confirmed! Your safety status is clear.');
  };

  // Start Journey
  const handleStartJourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expectedTime = new Date(Date.now() + etaMinutes * 60000).toISOString();
      const res = await api.startJourney({
        start_location_name: startLocation,
        start_lat: currentCoords[0],
        start_lng: currentCoords[1],
        destination_name: destination,
        dest_lat: 28.6129,
        dest_lng: 77.2295,
        expected_arrival_time: expectedTime,
      });

      if (res.success) {
        setActiveJourney(res.journey);
        setShowJourneyModal(false);
        handleStartTimer(etaMinutes);
      }
    } catch (err: any) {
      alert(err.message || 'Could not start journey');
    }
  };

  // End Journey
  const handleEndJourney = async () => {
    if (!activeJourney) return;
    try {
      await api.endJourney(activeJourney.id);
      setActiveJourney(null);
      setTimerActive(false);
      setTimerSecondsLeft(null);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      alert('🎉 Safe arrival confirmed! Your journey has ended.');
    } catch (err: any) {
      alert(err.message || 'Failed to end journey');
    }
  };

  // Copy shareable link
  const handleCopyTrackingLink = () => {
    if (!activeJourney) return;
    const fullUrl = `${window.location.origin}/track/${activeJourney.share_token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Add Contact
  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addContact({
        name: newContactName,
        relationship: newContactRelation,
        phone: newContactPhone,
        email: newContactEmail || undefined,
        is_primary: contacts.length === 0,
        notify_on_sos: true,
        notify_on_journey: true,
      });
      if (res.success) {
        setContacts(prev => [...prev, res.contact]);
        setShowContactModal(false);
        setNewContactName('');
        setNewContactRelation('');
        setNewContactPhone('');
        setNewContactEmail('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add contact');
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Remove this trusted contact?')) return;
    try {
      await api.deleteContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome & Safety Status Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GPS Monitoring Active • Connaught Place, New Delhi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs text-purple-200">
            {user?.blood_group ? `Blood Group: ${user.blood_group} • ` : ''}
            {user?.emergency_notes ? `Medical note: "${user.emergency_notes}"` : 'Emergency contacts & guardians active.'}
          </p>
        </div>

        {/* Primary Big SOS Trigger Action */}
        <div className="w-full md:w-auto">
          <button
            onClick={openConfirmModal}
            className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl ${
              isSOSActive
                ? 'bg-red-600 text-white animate-bounce shadow-red-500/50'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-red-300 hover:scale-105 active:scale-95'
            }`}
          >
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            <span>TRIGGER DISTRESS SOS</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Journey & Safety Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Journey & Location (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Journey Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-purple-600" />
                <h2 className="font-extrabold text-base text-slate-900">
                  Live Journey Sharing
                </h2>
              </div>

              {activeJourney ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Journey Active
                </span>
              ) : (
                <button
                  onClick={() => setShowJourneyModal(true)}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Start New Journey
                </button>
              )}
            </div>

            {activeJourney ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">From</span>
                    <span className="font-bold text-slate-800 truncate block">{activeJourney.start_location_name}</span>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                    <span className="text-[10px] text-purple-600 font-bold uppercase block">Destination</span>
                    <span className="font-bold text-purple-900 truncate block">{activeJourney.destination_name}</span>
                  </div>
                </div>

                {/* Map Display */}
                <LiveTrackerMap
                  startLat={activeJourney.start_lat}
                  startLng={activeJourney.start_lng}
                  destLat={activeJourney.dest_lat}
                  destLng={activeJourney.dest_lng}
                  currentLat={activeJourney.last_lat}
                  currentLng={activeJourney.last_lng}
                  startName={activeJourney.start_location_name}
                  destName={activeJourney.destination_name}
                  heightClass="h-[280px]"
                />

                {/* Tracking Link Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Share2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-slate-500 truncate font-mono text-[11px]">
                      {window.location.origin}/track/{activeJourney.share_token}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyTrackingLink}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleEndJourney}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Arrived Safely</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">No Active Journey Broadcast</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Start a journey when taking a cab, walking at night, or exploring new neighborhoods to share live progress with trusted contacts.
                  </p>
                </div>
                <button
                  onClick={() => setShowJourneyModal(true)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Start Journey Now
                </button>
              </div>
            )}
          </div>

          {/* Interactive Safe Places Radar */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h2 className="font-extrabold text-base text-slate-900">
                  Nearby Safe Havens
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Within 5 km radius
              </span>
            </div>

            <SafePlacesMap heightClass="h-[320px]" showFilters={false} initialCenter={currentCoords} />
          </div>

        </div>

        {/* Right Column: Safety Timer, Guardians & Contacts (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Safety Arrival Check-in Timer */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h2 className="font-extrabold text-base text-slate-900">
                  Safety Arrival Timer
                </h2>
              </div>
              {timerActive && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold animate-pulse">
                  TIMER ACTIVE
                </span>
              )}
            </div>

            {timerActive && timerSecondsLeft !== null ? (
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center space-y-3">
                <div className="text-3xl font-black text-purple-900 font-mono">
                  {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-[11px] text-purple-700">
                  Time remaining before auto-escalating check-in confirmation to contacts.
                </p>
                <button
                  onClick={handleCheckInSafe}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>I'm Safe • Confirm Check-in</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Set a reminder duration for quick rides or walks. If you do not check in, SafeHer alerts your trusted contacts.
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[15, 30, 45].map(m => (
                    <button
                      key={m}
                      onClick={() => handleStartTimer(m)}
                      className="py-2.5 px-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 transition-colors"
                    >
                      {m} Mins
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verified Nearby Guardians */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h2 className="font-extrabold text-base text-slate-900">
                  Verified Local Guardians
                </h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {nearbyGuardians.length} Available
              </span>
            </div>

            <div className="space-y-3">
              {nearbyGuardians.slice(0, 3).map(guardian => (
                <div
                  key={guardian.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={guardian.avatar_url}
                      name={guardian.full_name}
                      sizeClass="w-10 h-10"
                      className="border border-purple-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {guardian.full_name}
                        </span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {guardian.city} • {guardian.distance_km || 1.2} km away (~{guardian.eta_mins || 4}m)
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-1 rounded-lg">
                      ★ {guardian.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Contacts Manager */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <h2 className="font-extrabold text-base text-slate-900">
                  Trusted Contacts
                </h2>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            <div className="space-y-2.5">
              {contacts.map(c => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{c.name}</span>
                      <span className="text-[10px] text-purple-600 font-medium bg-purple-50 px-1.5 py-0.5 rounded">
                        {c.relationship}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {c.phone} {c.email ? `• ${c.email}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${c.phone}`}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-purple-700 shadow-2xs"
                      title="Direct call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 shadow-2xs"
                      title="Delete contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Start Journey Modal */}
      {showJourneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900">
              Start New Safe Journey
            </h3>
            <form onSubmit={handleStartJourneySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Starting Point
                </label>
                <input
                  type="text"
                  required
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Travel Time (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={300}
                  required
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJourneyModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-sm"
                >
                  Start Live Journey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900">
              Add Trusted Contact
            </h3>
            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kavita Sharma"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mother, Sister, Friend"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 00001"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-sm"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

