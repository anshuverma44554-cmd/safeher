import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Activity,
  MapPin,
  FileCheck,
  RefreshCw,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Avatar } from '../components/common/Avatar';
import { AdminStats, Guardian, User } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'guardians' | 'emergencies' | 'users' | 'logs'>('guardians');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search filter
  const [search, setSearch] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, guardiansRes, emergenciesRes, usersRes, logsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllGuardians(),
        api.getAllEmergencies(),
        api.getAllUsers(),
        api.getActivityLogs(25),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (guardiansRes.success) setGuardians(guardiansRes.guardians);
      if (emergenciesRes.success) setEmergencies(emergenciesRes.emergencies);
      if (usersRes.success) setUsers(usersRes.users);
      if (logsRes.success) setLogs(logsRes.logs);
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    const notes = prompt(`Audit notes for ${status.toUpperCase()} decision:`, status === 'approved' ? 'Government ID and background verification confirmed.' : 'Document incomplete.');
    if (notes === null) return;

    try {
      const res = await api.verifyGuardian(id, status, notes);
      if (res.success) {
        if (status === 'approved') {
          confetti({ particleCount: 80, spread: 60 });
        }
        alert(res.message);
        loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    }
  };

  const pendingGuardians = guardians.filter(g => g.verification_status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Central Trust & Safety Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SafeHer Administrator Hub
          </h1>
          <p className="text-xs text-slate-400">
            Monitor real-time SOS broadcasts, inspect guardian ID applications, and audit system activities.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Feeds</span>
        </button>
      </div>

      {/* High-Level Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total Users</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {stats?.totalUsers || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{stats?.travellersCount || 0} Travellers</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Verified Guardians</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {stats?.verifiedGuardiansCount || 0}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Active on-duty network</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Pending Applications</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {stats?.pendingGuardianApplications || 0}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Awaiting audit review</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Active SOS Alerts</div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">
            {stats?.activeEmergencies || 0}
          </div>
          <div className="text-[10px] text-red-600 font-semibold mt-0.5">
            {stats?.activeEmergencies ? '⚠️ Immediate attention' : 'Network calm'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Safe Places Directory</div>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">
            {stats?.totalSafePlaces || 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Police, Hospitals & Havens</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('guardians')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'guardians'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Guardian Verification Queue ({pendingGuardians.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('emergencies')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'emergencies'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Emergency Monitoring Console ({emergencies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: GUARDIAN APPLICATIONS */}
      {activeTab === 'guardians' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Guardian Applications & Verification Audit
              </h2>
              <p className="text-xs text-slate-500">
                Guardians cannot self-assign verified status. Review identification proofs and approve or reject.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              {pendingGuardians.length} Pending Approval
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Document Proof</th>
                  <th className="py-3 px-4">Bio / Background</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guardians.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={g.avatar_url}
                          name={g.full_name}
                          sizeClass="w-7 h-7"
                        />
                        <div>
                          <div className="font-bold">{g.full_name}</div>
                          <div className="text-[10px] text-slate-400">{g.email} • {g.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{g.city}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{g.identification_type}</div>
                      <a
                        href={g.id_document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-purple-700 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <span>View Document Proof</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 truncate text-[11px]" title={g.bio}>
                      {g.bio}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        g.verification_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : g.verification_status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {g.verification_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {g.verification_status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerify(g.id, 'rejected')}
                            className="px-2.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerify(g.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerify(g.id, g.verification_status === 'verified' ? 'rejected' : 'approved')}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-semibold underline"
                        >
                          Change Verdict
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EMERGENCY MONITORING */}
      {activeTab === 'emergencies' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Network-Wide Emergency Monitoring Feed
              </h2>
              <p className="text-xs text-slate-500">
                Real-time tracking of all distress beacons, response statuses, and escalations.
              </p>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              {emergencies.filter(e => !['resolved', 'cancelled'].includes(e.status)).length} Active Distresses
            </span>
          </div>

          <div className="space-y-3">
            {emergencies.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No emergencies recorded in network logs.
              </div>
            ) : (
              emergencies.map(e => (
                <div
                  key={e.id}
                  className={`p-4 rounded-2xl border text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    ['resolved', 'cancelled'].includes(e.status)
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-red-50/70 border-red-300 text-slate-900'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        e.status === 'resolved'
                          ? 'bg-emerald-600 text-white'
                          : e.status === 'cancelled'
                          ? 'bg-slate-400 text-white'
                          : 'bg-red-600 text-white animate-pulse'
                      }`}>
                        {e.status}
                      </span>
                      <span className="font-extrabold text-sm">{e.traveller_name}</span>
                      <span className="text-slate-500">• {new Date(e.created_at).toLocaleTimeString()}</span>
                      {e.escalation_level > 1 && (
                        <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[9px] font-black">
                          ESCALATION L{e.escalation_level}
                        </span>
                      )}
                    </div>
                    <p className="italic text-slate-600">
                      "{e.message || 'Distress beacon activated'}"
                    </p>
                    <div className="text-[11px] text-slate-500">
                      Coordinates: [{e.latitude?.toFixed(4)}, {e.longitude?.toFixed(4)}] • Assigned: {e.guardian_name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!['resolved', 'cancelled'].includes(e.status) && (
                      <button
                        onClick={async () => {
                          await api.updateEmergencyStatus(e.id, 'resolved', 'Admin resolved distress signal manually.');
                          loadAdminData();
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                      >
                        Force Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-base text-slate-900">
              Platform Registered Users
            </h2>
            <span className="text-xs text-slate-500">{users.length} Total Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Blood Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4 text-slate-600">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'guardian'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{u.blood_group || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-extrabold text-base text-slate-900">
              System Audit Trail
            </h2>
            <span className="text-xs text-slate-500">Immutable Activity Records</span>
          </div>

          <div className="space-y-2">
            {logs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between gap-4 font-mono"
              >
                <div>
                  <span className="font-bold text-purple-700">[{log.action}]</span>{' '}
                  <span className="text-slate-800">{log.user_name}</span>{' '}
                  <span className="text-slate-500 text-[11px]">
                    {log.details ? JSON.stringify(log.details) : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

