import React from 'react';
import { AlertOctagon, PhoneCall, Check, X, Shield, Clock } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const ActiveSosBanner: React.FC = () => {
  const { isSOSActive, activeEmergency, assignedGuardian, cancelSOS, resolveSOS } = useEmergency();

  if (!isSOSActive || !activeEmergency) return null;

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg animate-in slide-in-from-top">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Status Details */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-lg animate-pulse">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase tracking-wider text-sm">
                  Distress Signal Active
                </span>
                <span className="bg-red-950/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-400/40">
                  Status: {activeEmergency.status}
                </span>
                {activeEmergency.escalation_level > 1 && (
                  <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                    ESCALATION LVL {activeEmergency.escalation_level}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-red-100 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3" />
                Live coordinates broadcasted • Contacts alerted
                {assignedGuardian && (
                  <span className="font-bold text-white ml-2 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-300" />
                    Guardian {assignedGuardian.full_name} is responding!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {assignedGuardian && assignedGuardian.emergency_phone && (
              <a
                href={`tel:${assignedGuardian.emergency_phone}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call Guardian
              </a>
            )}

            <a
              href="tel:112"
              className="px-3 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 font-extrabold flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              Call 112
            </a>

            <button
              onClick={() => {
                if (window.confirm('Are you in a safe situation and wish to resolve this emergency?')) {
                  resolveSOS('User confirmed safe and resolved distress call.');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 transition-colors"
              title="Mark as safe"
            >
              <Check className="w-3.5 h-3.5" />
              I'm Safe
            </button>

            <button
              onClick={() => {
                const reason = window.prompt('Cancel reason (e.g., false alarm):');
                if (reason !== null) {
                  cancelSOS(reason);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-900/80 hover:bg-red-950 text-red-100 font-semibold flex items-center gap-1 transition-colors border border-red-400/30"
              title="Cancel emergency"
            >
              <X className="w-3.5 h-3.5" />
              Cancel SOS
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

