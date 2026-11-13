import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  MapPin,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Navigation,
  ShieldCheck,
  LifeBuoy,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { isSOSActive, openConfirmModal } = useEmergency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDemoSwitch = async (role: 'traveller' | 'guardian' | 'admin') => {
    setDemoDropdownOpen(false);
    await demoLogin(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'guardian') navigate('/guardian');
    else navigate('/dashboard');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'guardian') return '/guardian';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#07090E]/85 backdrop-blur-2xl border-b border-purple-900/40 shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 group-hover:shadow-purple-500/50 transition-all duration-300 border border-purple-400/30">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#07090E]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  Safe<span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">Her</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60 shadow-xs">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
                Travel Freely. Stay Safely.
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-purple-900/40">
            <Link
              to="/safe-places"
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/safe-places'
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-700/60 shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-4 h-4 text-purple-400" />
              Safe Places Map
            </Link>

            <Link
              to="/assistant"
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/assistant'
                  ? 'bg-purple-950/80 text-purple-200 border border-purple-700/60 shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Safety Copilot
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardPath()}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  location.pathname.includes('dashboard') || location.pathname.includes('guardian') || location.pathname.includes('admin')
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-700/60 shadow-xs font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Navigation className="w-4 h-4 text-indigo-400" />
                {user?.role === 'admin' ? 'Admin Console' : user?.role === 'guardian' ? 'Guardian Portal' : 'Traveller Dashboard'}
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* High-Impact Glowing SOS Trigger Button */}
            <button
              onClick={openConfirmModal}
              className={`relative group px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all duration-300 ${
                isSOSActive
                  ? 'bg-red-600 text-white animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.7)] ring-4 ring-red-500/40'
                  : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-[1.03] active:scale-95 border border-red-400/40'
              }`}
              title="Activate Emergency Distress Beacon"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">EMERGENCY SOS</span>
              <span className="sm:hidden font-extrabold">SOS</span>
            </button>

            {/* Demo Account Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="px-3 py-2 rounded-full border border-purple-800/60 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:border-purple-600"
                title="Switch demo persona for instant testing"
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                <span className="inline">Demo Personas</span>
                <ChevronDown className={`w-3.5 h-3.5 text-purple-400 transition-transform duration-200 ${demoDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0B0F19]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-purple-700/40 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center justify-between border-b border-purple-900/40 pb-1.5">
                    <span>1-Click Persona Testing</span>
                    <span className="text-emerald-400">● Live</span>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => handleDemoSwitch('traveller')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-purple-950/60 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                      <div className="min-w-0">
                        <div className="font-bold text-white">Priya (Solo Traveller)</div>
                        <div className="text-[10px] text-slate-400 truncate">Delhi trip • Active journey & contacts</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDemoSwitch('guardian')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-emerald-950/60 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <div className="min-w-0">
                        <div className="font-bold text-white">Sunita (Verified Guardian)</div>
                        <div className="text-[10px] text-slate-400 truncate">On duty • 4.98 ★ • CP Zone</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDemoSwitch('admin')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-indigo-950/60 hover:text-white flex items-center gap-2.5 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                      <div className="min-w-0">
                        <div className="font-bold text-white">Operations Admin</div>
                        <div className="text-[10px] text-slate-400 truncate">Verification Queue & SOS Monitor</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full hover:bg-purple-950/50 border border-purple-900/40 hover:border-purple-700 transition-all"
                >
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name}`}
                    alt={user?.full_name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-purple-500/50 object-cover"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-white leading-tight">
                      {user?.full_name?.split(' ')[0]}
                    </div>
                    <div className="text-[10px] font-extrabold text-purple-400 capitalize">
                      {user?.role}
                    </div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-950/30 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-xs font-bold text-purple-300 hover:text-white hover:bg-purple-950/50 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-95 transition-all border border-purple-400/30"
                >
                  Join SafeHer
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-900/50 bg-[#0B0F19]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/safe-places"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-purple-950/60 hover:text-white"
          >
            Safe Places Map
          </Link>
          <Link
            to="/assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-purple-950/60 hover:text-white"
          >
            AI Safety Copilot
          </Link>
          {isAuthenticated ? (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-300 bg-purple-950/50"
            >
              {user?.role === 'admin' ? 'Admin Console' : user?.role === 'guardian' ? 'Guardian Portal' : 'Traveller Dashboard'}
            </Link>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-purple-300 border border-purple-800/60 rounded-full"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg"
              >
                Join SafeHer
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

