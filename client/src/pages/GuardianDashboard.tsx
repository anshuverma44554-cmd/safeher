import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Navigation,
  Radio,
  FileCheck,
  Power
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { api } from '../services/api';
import { Guardian } from '../types';

export const GuardianDashboard: React.FC = () => {
  const { user, guardian, refreshUser } = useAuth();
  const { incomingAlerts, respondToEmergency, refreshEmergency } = useEmergency();

  const [guardianProfile, setGuardianProfile] = useState<Guardian | null>(guardian);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [activeAssist, setActiveAssist] = useState<any | null>(null);

  // Application form for unverified or rejected guardians
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [bio, setBio] = useState(guardian?.bio || '');
  const [city, setCity] = useState(guardian?.city || 'New Delhi');
  const [idType, setIdType] = useState(guardian?.identification_type || 'National Identity Card (Aadhaar/Voter)');
  const [idDocUrl, setIdDocUrl] = useState(guardian?.id_document_url || 'https://safeher.org/docs/verification_sample.pdf');
  const [emergencyPhone, setEmergencyPhone] = useState(guardian?.emergency_phone || user?.phone || '');

  const loadProfile = async () => {
    try {
      const res = await api.getMyGuardianProfile();
      if (res.success && res.guardian) {
        setGuardianProfile(res.guardian);
      }
    } catch (err) {
      console.warn('Could not fetch guardian profile:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Check if guardian currently has an accepted emergency in responding status
  useEffect(() => {
    const accepted = incomingAlerts.find(a => a.status === 'accepted' || a.status === 'responding');
    setActiveAssist(accepted || null);
  }, [incomingAlerts]);

  const handleToggleDuty = async () => {
    if (!guardianProfile) return;
    if (guardianProfile.verification_status !== 'verified') {
      alert('Only admin-verified guardians can toggle availability. Your verification status is currently: ' + guardianProfile.verification_status.toUpperCase());
      return;
    }

    setIsTogglingAvailability(true);
    try {
      const res = await api.toggleGuardianAvailability(!guardianProfile.is_available, 28.6315, 77.2167);
      if (res.success) {
        setGuardianProfile(prev => prev ? { ...prev, is_available: res.is_available } : null);
        refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleRespond = async (id: string, action: 'accept' | 'reject') => {
    try {
      await respondToEmergency(id, action);
      refreshEmergency();
      loadProfile();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleStatusUpdate = async (id: string, status: 'responding' | 'resolved') => {
    try {
      await api.updateEmergencyStatus(id, status);
      refreshEmergency();
      loadProfile();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.applyGuardian({
        bio,
        languages: ['English', 'Hindi'],
        address: 'Delhi NCR Area',
        city,
        identification_type: idType,
        id_document_url: idDocUrl,
        emergency_phone: emergencyPhone,
      });
      if (res.success) {
        alert('Application submitted! It is now in the Admin Verification Queue.');
        setShowApplyForm(false);
        loadProfile();
        refreshUser();
      }
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    }
  };

  const isVerified = guardianProfile?.verification_status === 'verified';
  const isPending = guardianProfile?.verification_status === 'pending';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Verification Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified SafeHer Community Guardian
              </span>
            ) : isPending ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                Identity Verification Pending Admin Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Application Unverified
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Guardian Portal: {user?.full_name}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            {guardianProfile?.bio || 'Local community first responder providing volunteer safety escort & emergency coordination.'}
          </p>
        </div>

        {/* Availability Toggle Button */}
        <div className="w-full md:w-auto flex flex-col items-end gap-2">
          <button
            onClick={handleToggleDuty}
            disabled={!isVerified || isTogglingAvailability}
            className={`w-full md:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
              guardianProfile?.is_available
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            } ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Power className="w-4 h-4" />
            <span>{guardianProfile?.is_available ? 'ON DUTY (AVAILABLE)' : 'OFF DUTY (OFFLINE)'}</span>
          </button>
          {!isVerified && (
            <span className="text-[10px] text-amber-300 italic">
              Verification required to toggle duty
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Community Rating</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">
            ★ {guardianProfile?.rating || '5.00'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">From verified travellers</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Escorts & Assists</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {guardianProfile?.total_assists || 0}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Successful safety dispatches</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Operational Hub</div>
          <div className="text-base font-extrabold text-slate-900 mt-1 truncate">
            {guardianProfile?.city || 'Delhi / NCR'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Central radius 15km</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">ID Document Status</div>
          <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
            {guardianProfile?.identification_type || 'Aadhaar / Passport'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
            Audit: {guardianProfile?.verification_status || 'Pending'}
          </div>
        </div>
      </div>

      {/* Active Rescue Assistance Panel (If Guardian has accepted an emergency) */}
      {activeAssist && (
        <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 text-white rounded-2xl animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  Active Emergency Response In Progress
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Assisting Solo Traveller: {activeAssist.traveller_name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeAssist.traveller_phone && (
                <a
                  href={`tel:${activeAssist.traveller_phone}`}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  Call Traveller ({activeAssist.traveller_phone})
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-red-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Reported Coordinates</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">
                Lat: {activeAssist.latitude?.toFixed(4)}, Lng: {activeAssist.longitude?.toFixed(4)}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {activeAssist.address || 'Central Delhi Metro Corridor'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-red-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Proximity & ETA</span>
              <span className="font-extrabold text-slate-900 mt-0.5 block">
                {activeAssist.distance_km || 1.2} km away
              </span>
              <span className="text-[11px] text-purple-700 font-bold mt-1 block">
                Approx ~{activeAssist.eta_mins || 4} mins walking distance
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-red-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Distress Message</span>
              <span className="text-slate-800 italic mt-0.5 block">
                "{activeAssist.message || 'Distress beacon activated'}"
              </span>
              {activeAssist.battery_level && (
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Battery level: {activeAssist.battery_level}%
                </span>
              )}
            </div>
          </div>

          {/* Action Update Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleStatusUpdate(activeAssist.id, 'responding')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm"
            >
              Mark Status: En Route (Responding)
            </button>
            <button
              onClick={() => handleStatusUpdate(activeAssist.id, 'resolved')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Emergency Resolved (Safe)
            </button>
          </div>
        </div>
      )}

      {/* Incoming Requests Feed */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-600" />
            <h2 className="font-extrabold text-base text-slate-900">
              Incoming Distress Requests Nearby
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {incomingAlerts.length} Active in Network
          </span>
        </div>

        {incomingAlerts.length === 0 ? (
          <div className="text-center py-10 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="font-extrabold text-sm text-slate-800">
              No Active Emergencies in Your Area
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You are on standby. Keep your availability toggle on to receive notifications when a solo traveller requests help.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-red-50/60 border border-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600 text-white">
                      SOS ALERT
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {alert.traveller_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {alert.distance_km ? `${alert.distance_km} km away` : 'Nearby'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 italic">
                    "{alert.message || 'Distress beacon activated'}"
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Location: {alert.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRespond(alert.id, 'reject')}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespond(alert.id, 'accept')}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-200 transition-colors"
                  >
                    Accept & Deploy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Details / Re-apply Modal */}
      {!isVerified && (
        <div className="p-6 bg-purple-50 rounded-3xl border border-purple-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-purple-700" />
              <h3 className="font-extrabold text-base text-purple-900">
                Guardian Verification Status & Documents
              </h3>
            </div>
            <button
              onClick={() => setShowApplyForm(!showApplyForm)}
              className="px-3 py-1.5 bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              {showApplyForm ? 'Close Form' : 'Update Application Details'}
            </button>
          </div>

          <p className="text-xs text-purple-800 leading-relaxed">
            SafeHer verifies all community guardians through government ID checks, address verification, and emergency response screening.
          </p>

          {showApplyForm && (
            <form onSubmit={handleApplySubmit} className="pt-4 border-t border-purple-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operational City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Direct Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ID Document Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="National Identity Card (Aadhaar/Voter)">National ID / Aadhaar</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="University / NGO Faculty ID">University / NGO Faculty ID</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bio & First Responder Background</label>
                <textarea
                  rows={2}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-sm"
                >
                  Resubmit Application for Admin Review
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
};

