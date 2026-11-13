import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  MapPin,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  Navigation,
  CheckCircle,
  PhoneCall,
  ArrowRight,
  Heart,
  Eye,
  Lock,
  Globe,
  Radio,
  Share2,
  BatteryCharging,
  Compass,
  Star,
  Activity,
  UserCheck,
  ChevronRight,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { SafePlacesMap } from '../components/map/SafePlacesMap';
import { Avatar } from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { TestimonialGlobeDemo } from '../components/ui/testimonial-globe-demo';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { openConfirmModal } = useEmergency();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'traveller' | 'guardian' | 'admin') => {
    await demoLogin(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'guardian') navigate('/guardian');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-purple-600 selection:text-white font-sans">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-[#07090E]">
        
        {/* Lightweight Pure CSS Ambient Glow Orbs in Deep Black Background */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-pink-700/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[250px] bg-indigo-700/10 rounded-full blur-[130px] -z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:28px_28px] opacity-20 -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Top Shimmer Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-950/60 backdrop-blur-md border border-purple-500/40 text-purple-300 text-xs font-bold tracking-wide shadow-[0_0_25px_rgba(168,85,247,0.2)] hover:border-purple-400 transition-all">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                </span>
                <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-200 bg-clip-text text-transparent">
                  ✨ The #1 Women-First Travel Safety Ecosystem
                </span>
              </div>

              {/* Bold High-Impact Headline with Neon Gradient */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Travel Freely. <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.35)]">
                  Stay Safely.
                </span>
              </h1>

              {/* Clear Sub-headline */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                SafeHer connects solo women travellers with <strong className="text-white">verified local guardians</strong>, <strong className="text-white">live consent-based journey sharing</strong>, <strong className="text-white">smart 3s emergency SOS</strong>, and <strong className="text-white">Gemini AI safety guidance</strong> in unfamiliar cities. Not just an alarm — a real-time digital protection network.
              </p>

              {/* 4 Trust & Security Pillars - Dark Neon Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-w-2xl mx-auto lg:mx-0">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-purple-500/30 flex items-center gap-2 text-[11px] font-bold text-purple-200 shadow-xs">
                  <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Verified Guardians</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-2 text-[11px] font-bold text-emerald-200 shadow-xs">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No-App Tracking</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/30 flex items-center gap-2 text-[11px] font-bold text-rose-200 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>3s SOS Interlock</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 flex items-center gap-2 text-[11px] font-bold text-indigo-200 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Gemini AI Safety</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-[0_0_30px_rgba(147,51,234,0.45)] hover:shadow-[0_0_40px_rgba(147,51,234,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 group border border-purple-400/30"
                >
                  <span>Start Your Safe Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={openConfirmModal}
                  className="px-6 py-3.5 rounded-full bg-red-950/40 hover:bg-red-900/50 text-red-300 font-extrabold text-sm border-2 border-red-500/50 hover:border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 stroke-[2.5]" />
                  <span>Test Emergency SOS (Demo)</span>
                </button>
              </div>

              {/* Instant 1-Click Persona Testing Bar */}
              <div className="pt-5 border-t border-purple-900/40">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <p className="text-[11px] font-black uppercase tracking-wider text-purple-300">
                    ⚡ 1-Click Persona Testing (Live Sandbox):
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <button
                    onClick={() => handleQuickDemo('traveller')}
                    className="p-3 rounded-2xl bg-[#0D121F] hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/50 text-left transition-all shadow-md hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-700/50 text-purple-200 flex items-center justify-center font-bold text-sm shrink-0">
                      👩
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>Priya</span>
                        <span className="text-[10px] text-purple-300 font-semibold bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-800/40">Traveller</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">Delhi Solo Trip</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('guardian')}
                    className="p-3 rounded-2xl bg-[#0D121F] hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/50 text-left transition-all shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                      🛡️
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>Sunita</span>
                        <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/40">Guardian</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">4.98 ★ • On Duty</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="p-3 rounded-2xl bg-[#0D121F] hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 text-left transition-all shadow-md hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center gap-2.5 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 flex items-center justify-center font-bold text-sm shrink-0">
                      ⚙️
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>Operations</span>
                        <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/40">Admin</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">Live Command</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column / Live Safety Command Cockpit (OLED Dark Glass) */}
            <div className="lg:col-span-5 w-full max-w-lg mx-auto">
              <div className="relative bg-[#0D121F]/90 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_50px_rgba(147,51,234,0.18)] border border-purple-500/30 overflow-hidden space-y-4">
                
                {/* Decorative Top Accent Glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>

                {/* Radar Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-white tracking-tight">
                      Live Safety Radar Active
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/60 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    Connaught Place, New Delhi
                  </span>
                </div>

                {/* Active Journey Simulation Card */}
                <div className="p-3.5 rounded-2xl bg-[#090D16] border border-purple-900/50 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                      Active Protected Journey
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      On Route • 8m ETA
                    </span>
                  </div>

                  {/* Route points */}
                  <div className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] shrink-0"></div>
                      <span className="text-slate-400 text-[11px]">From:</span>
                      <span className="font-semibold text-slate-200 truncate text-[11px]">Janpath Guest House</span>
                    </div>
                    <div className="w-0.5 h-2 bg-purple-800 ml-1"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] shrink-0"></div>
                      <span className="text-slate-400 text-[11px]">To:</span>
                      <span className="font-bold text-white truncate text-[11px]">Lodhi Art District (2.4 km)</span>
                    </div>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-[#0B0F19] border border-slate-800 flex items-center justify-center gap-1 text-slate-300">
                      <BatteryCharging className="w-3 h-3 text-emerald-400" />
                      <span className="font-bold text-white">88%</span> Batt
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#0B0F19] border border-slate-800 flex items-center justify-center gap-1 text-slate-300">
                      <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span className="font-bold text-white">99.8%</span> GPS
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#0B0F19] border border-slate-800 flex items-center justify-center gap-1 text-slate-300">
                      <Lock className="w-3 h-3 text-purple-400" />
                      <span className="font-bold text-white">AES-256</span>
                    </div>
                  </div>
                </div>

                {/* Nearby Verified Guardian Proximity Card */}
                <div className="p-3.5 rounded-2xl bg-[#090D16] border border-purple-900/50 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      Closest Verified Guardian
                    </span>
                    <span className="text-emerald-400 font-extrabold text-[11px]">
                      4 Nearby Available
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-950/40 border border-purple-800/40">
                    <Avatar
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
                      name="Sunita Rao"
                      sizeClass="w-10 h-10"
                      className="border-2 border-purple-400 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">Sunita Rao</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-300 truncate">
                        Red Cross First Responder • 1.2 km away
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-extrabold text-purple-200 bg-purple-900/80 px-2 py-0.5 rounded-md border border-purple-700/60">
                        ★ 4.98
                      </div>
                      <div className="text-[9px] text-emerald-400 font-bold mt-0.5">4m walk ETA</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded-xl bg-[#0B0F19] border border-slate-800">
                      <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Safe Havens</div>
                      <div className="text-xs font-black text-white">6 within 3km</div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0B0F19] border border-slate-800">
                      <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">SOS Interlock</div>
                      <div className="text-xs font-black text-emerald-400">3s Anti-Mistake</div>
                    </div>
                  </div>
                </div>

                {/* Big SOS Button Simulation */}
                <button
                  onClick={openConfirmModal}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 group transition-all duration-200 active:scale-98 border border-red-400/40"
                >
                  <AlertTriangle className="w-4 h-4 group-hover:scale-110 transition-transform stroke-[2.5]" />
                  <span>Tap to Test 3-Second SOS Interlock</span>
                </button>

                <p className="text-[10px] text-slate-300 text-center">
                  Strictly consent-based • Zero hidden surveillance • 100% private
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* THE PROBLEM STATEMENT - DARK THEME */}
      <section className="py-20 bg-[#090D16] border-y border-purple-900/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
              The Reality of Solo Female Travel
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why Traditional SOS Apps Fall Short
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Most emergency apps are passive sound sirens or unmonitored buttons. When a solo traveller encounters a dark alley, an unexpected cab deviation, or an intimidating situation in an unfamiliar city, waiting for family in another timezone is insufficient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            <div className="p-7 rounded-3xl bg-[#0D121F] border border-slate-800 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-600/30 border border-purple-400/30">
                01
              </div>
              <h3 className="font-extrabold text-lg text-white">Geographic Disorientation</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Not knowing local emergency booth locations, 24/7 pharmacies, or trusted public safe zones in unfamiliar cities after dark.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0D121F] border border-slate-800 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-600/30 border border-purple-400/30">
                02
              </div>
              <h3 className="font-extrabold text-lg text-white">Slow Distant Response</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Family members receiving an SMS hundreds of kilometers away cannot offer immediate physical presence, shelter, or local escort.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0D121F] border border-slate-800 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-600/30 border border-purple-400/30">
                03
              </div>
              <h3 className="font-extrabold text-lg text-white">Language & Cultural Barriers</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Difficulty articulating distress, communicating street locations, or giving medical instructions in local languages during high stress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW SAFEHER WORKS - DARK THEME */}
      <section className="py-20 bg-[#07090E] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
              Comprehensive Protection Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How SafeHer Protects You Every Step
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From the moment you begin walking to your safe arrival at your accommodation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Start Consent Journey',
                icon: Navigation,
                desc: 'Enter your destination & expected arrival time. Share a live private tracking link with loved ones.'
              },
              {
                step: '02',
                title: 'Real-Time Safe Zones',
                icon: MapPin,
                desc: 'Locate verified 24/7 police kiosks, well-lit cafes, hospitals, and transit hubs on interactive radar maps.'
              },
              {
                step: '03',
                title: 'Verified Guardians',
                icon: Shield,
                desc: 'Community guardians vetted by SafeHer Admin stand on-duty ready to assist or escort in emergencies.'
              },
              {
                step: '04',
                title: 'Smart SOS & Escalation',
                icon: AlertTriangle,
                desc: '3-second accidental cancel interlock triggers simultaneous contact dispatch & guardian alert.'
              }
            ].map((item, i) => (
              <div key={i} className="relative p-6 bg-[#0D121F] rounded-3xl border border-slate-800 shadow-md hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 space-y-4">
                <span className="text-4xl font-black text-purple-900/40 block">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 text-purple-300 flex items-center justify-center border border-purple-800/60">
                  <item.icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="font-black text-white text-base">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE FEATURES SHOWCASE */}
      <section className="py-20 bg-[#090D16] border-y border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
              Smart Digital Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for Complete Peace of Mind
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-7 rounded-3xl bg-[#0D121F] border border-slate-800 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/30">
                <Sparkles className="w-6 h-6 text-amber-300" />
              </div>
              <h3 className="text-lg font-black text-white">
                Gemini AI Safety Copilot
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Trained on solo travel safety principles. Ask about neighborhood safety, taxi ride precautions, hotel door security, or get instant multilingual emergency phrases.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0D121F] border border-slate-800 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/30">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                Arrival Check-in Timer
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Set an expected arrival timer (e.g. 20 minutes for a short cab ride). If you do not check in safely before timeout, configured trusted contacts receive an alert.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#0D121F] border border-slate-800 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/30">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">
                No-App Web Tracking Link
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Share a secure unique tracking token (`/track/:token`) with your family. They can follow your live coordinates in any mobile browser without downloading an app.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE SAFE PLACES MAP EMBED */}
      <section className="py-20 bg-[#07090E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
                Geographic Safety Directory
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight mt-2">
                Explore Safe Public Havens
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Verified women police booths, 24/7 trauma hospitals, pharmacies, and safe partner cafes.
              </p>
            </div>

            <Link
              to="/safe-places"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-300 hover:text-white bg-[#0D121F] px-4 py-2.5 rounded-full border border-purple-800/60 shadow-md hover:border-purple-500 transition-all"
            >
              <span>View Fullscreen Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="rounded-3xl overflow-hidden border border-purple-800/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-[#0D121F] p-2">
            <SafePlacesMap heightClass="h-[480px]" showFilters={true} />
          </div>
        </div>
      </section>

      {/* STATS & CREDIBILITY - HIGH CONTRAST DARK */}
      <section className="py-16 bg-gradient-to-r from-purple-950 via-[#07090E] to-indigo-950 text-white relative overflow-hidden border-y border-purple-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1.5">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                73%
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                Solo Women Travellers
              </div>
              <div className="text-[10px] text-purple-400">
                Prioritize Safety Over Cost
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                &lt; 3 mins
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                Guardian Dispatch Window
              </div>
              <div className="text-[10px] text-purple-400">
                High Density Metro Zones
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                100%
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                Admin-Verified Documents
              </div>
              <div className="text-[10px] text-purple-400">
                Government ID & Police Vetting
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                24 / 7
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200">
                Safe Haven Network
              </div>
              <div className="text-[10px] text-purple-400">
                Continuous Community Updates
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIALS - DARK THEME */}
      <section className="py-20 bg-[#07090E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/60">
              Community Voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by Solo Travellers
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              * Simulated pilot feedback from early solo travellers and community guardians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Travelling alone in Delhi for a tech conference was daunting. SafeHer's live tracking let my mother sleep peacefully, and having verified guardians nearby made me feel protected.",
                name: "Priya Sharma",
                role: "Software Engineer & Solo Traveller",
                location: "New Delhi, India",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
              },
              {
                quote: "As a local business owner, joining the SafeHer guardian network let me contribute directly to women's safety in Connaught Place. The verification process was thorough and professional.",
                name: "Sunita Rao",
                role: "Certified Community Guardian",
                location: "Connaught Place, New Delhi",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"
              },
              {
                quote: "The safety timer is genius. When my late-night cab took an unfamiliar bypass route, the AI copilot immediately advised me to check the driver ID and prepare my SOS beacon.",
                name: "Camille Laurent",
                role: "Travel Blogger",
                location: "Paris, France",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-7 rounded-3xl bg-[#0D121F] border border-slate-800 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <Avatar
                    src={t.avatar}
                    name={t.name}
                    sizeClass="w-11 h-11"
                    className="border-2 border-purple-500/50 shadow-sm"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{t.name}</div>
                    <div className="text-[11px] text-purple-400 font-semibold">{t.role}</div>
                    <div className="text-[10px] text-slate-300">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3D Interactive Testimonial Globe - SafeHer World Network */}
          <div className="mt-14 pt-10 border-t border-slate-800/80">
            <TestimonialGlobeDemo />
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-purple-950 via-[#0B0F19] to-indigo-950 text-white text-center relative overflow-hidden border-t border-purple-900/40">
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-purple-900/50 backdrop-blur-md mx-auto flex items-center justify-center text-white border border-purple-500/40 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
            <Shield className="w-7 h-7 text-purple-300 stroke-[2.2]" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Explore With Confidence?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join the SafeHer digital safety community today. Whether travelling solo or volunteering as a verified local guardian, your presence creates a safer world.
          </p>
          <div className="flex flex-wrap justify-center gap-3.5 pt-3">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-full bg-white text-purple-950 font-black text-xs sm:text-sm shadow-xl hover:bg-purple-100 transition-all hover:scale-105 active:scale-95"
            >
              Sign Up as Traveller
            </Link>
            <Link
              to="/register?role=guardian"
              className="px-8 py-3.5 rounded-full bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-black text-xs sm:text-sm border border-purple-600/60 shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Apply as a Guardian
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

