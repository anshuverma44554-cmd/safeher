import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, PhoneCall, Volume2, VolumeX, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const EmergencyModal: React.FC = () => {
  const { isConfirmModalOpen, closeConfirmModal, triggerSOS } = useEmergency();
  const [countdown, setCountdown] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSirenOn, setIsSirenOn] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Play synthesized siren using Web Audio API without needing external MP3
  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioCtxRef.current = ctx;
      oscillatorRef.current = osc;
      setIsSirenOn(true);
    } catch (e) {
      console.warn('Audio siren could not start automatically:', e);
    }
  };

  const stopSiren = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    } catch (e) {
      // ignore
    }
    audioCtxRef.current = null;
    oscillatorRef.current = null;
    setIsSirenOn(false);
  };

  // Reset countdown whenever modal opens
  useEffect(() => {
    if (isConfirmModalOpen) {
      setCountdown(3);
      setIsSubmitting(false);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleConfirm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        stopSiren();
      };
    } else {
      stopSiren();
    }
  }, [isConfirmModalOpen]);

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await triggerSOS({ message: customMessage || 'URGENT: Traveller triggered distress beacon!' });
    } finally {
      setIsSubmitting(false);
      closeConfirmModal();
    }
  };

  const handleCancel = () => {
    stopSiren();
    closeConfirmModal();
  };

  if (!isConfirmModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0D121F] rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.35)] border-2 border-red-500 overflow-hidden text-white">
        
        {/* Pulsing Emergency Top Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-6 py-4 flex items-center justify-between border-b border-red-400/30">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 animate-bounce" />
            <span className="font-extrabold text-lg tracking-wide uppercase">
              Emergency Distress Interlock
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-6">
          
          {/* Animated Countdown Visual */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-red-500">
                {countdown}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Seconds
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">
              Broadcasting Distress Signal in {countdown}s
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              This will immediately send your live coordinates to your configured trusted contacts and alert nearby verified guardians.
            </p>
          </div>

          {/* Quick Siren Simulation Toggle */}
          <div className="flex justify-center gap-3">
            <button
              onClick={isSirenOn ? stopSiren : startSiren}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSirenOn
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isSirenOn ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              {isSirenOn ? 'Stop Audible Alarm' : 'Sound Alarm Siren'}
            </button>

            <a
              href="tel:112"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-950/80 text-red-300 hover:bg-red-900/80 border border-red-700/60 flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              Call 112 Directly
            </a>
          </div>

          {/* Optional Quick Message */}
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Optional message / details:
            </label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="e.g. In auto-rickshaw near metro station..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Action Buttons: Cancel vs Confirm Now */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel (Accidental)
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-extrabold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Broadcasting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Send SOS Now</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

