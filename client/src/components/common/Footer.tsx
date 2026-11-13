import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Heart, ExternalLink, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Emergency Hotlines Strip */}
      <div className="bg-purple-950/80 border-b border-purple-900/60 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-purple-200 font-semibold">
            <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
            <span>24/7 Official Emergency Hotlines:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <a href="tel:112" className="flex items-center gap-1.5 hover:text-white font-bold bg-purple-900/50 px-2.5 py-1 rounded-md border border-purple-700/50">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Police / Ambulance: 112
            </a>
            <a href="tel:1091" className="flex items-center gap-1.5 hover:text-white font-bold bg-purple-900/50 px-2.5 py-1 rounded-md border border-purple-700/50">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Women Safety Helpline: 1091
            </a>
            <a href="tel:1363" className="flex items-center gap-1.5 hover:text-white font-bold bg-purple-900/50 px-2.5 py-1 rounded-md border border-purple-700/50">
              Tourist Helpline: 1363
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Safe<span className="text-purple-400">Her</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Travel Freely. Stay Safely. A women-first travel safety ecosystem connecting solo travellers with verified community guardians, live journey tracking, and AI safety intelligence.
            </p>
          </div>

          {/* Quick Platform Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safe-places" className="hover:text-purple-300 transition-colors">
                  Safe Places Directory
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-purple-300 transition-colors">
                  AI Travel Safety Copilot
                </Link>
              </li>
              <li>
                <Link to="/register?role=guardian" className="hover:text-purple-300 transition-colors">
                  Apply as a Guardian
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-purple-300 transition-colors">
                  Traveller Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Trust */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Safety Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Admin-Verified Guardian Network</li>
              <li>• Real-Time GPS Journey Broadcast</li>
              <li>• 3-Second SOS Safety Interlock</li>
              <li>• Zero Background Hidden Tracking</li>
              <li>• End-to-End Consent Architecture</li>
            </ul>
          </div>

          {/* Compliance & Technology */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Technology & AI
            </h4>
            <p className="text-xs text-slate-400 mb-2 leading-relaxed">
              Built on React, TypeScript, Node.js, Express, OpenStreetMap / Leaflet, and powered by Google Gemini API.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>
                SafeHer coordinates voluntary peer assistance and public safety data. Always contact official emergency services (112) for immediate police dispatch.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SafeHer Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Engineered with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for women's solo travel security worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

