import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  Navigation,
  Clock,
  Battery,
  AlertTriangle,
  Phone,
  CheckCircle2,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { api } from '../services/api';
import { Journey } from '../types';
import { LiveTrackerMap } from '../components/map/LiveTrackerMap';
import { Avatar } from '../components/common/Avatar';

export const PublicTrackingPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastPollTime, setLastPollTime] = useState<string>(new Date().toLocaleTimeString());

  const fetchSharedJourney = async () => {
    if (!shareToken) return;
    try {
      const res = await api.getSharedJourney(shareToken);
      if (res.success && res.journey) {
        setJourney(res.journey);
        setLastPollTime(new Date().toLocaleTimeString());
      } else {
        setError('This shared tracking link has expired or is invalid.');
      }
    } catch (err: any) {
      setError(err.message || 'Shared journey not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedJourney();
    const interval = setInterval(fetchSharedJourney, 5000);
    return () => clearInterval(interval);
  }, [shareToken]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Connecting to SafeHer Live Journey Broadcast...</p>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Tracking Link Inactive</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'This live journey link is no longer broadcasting or has already safely arrived.'}
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-purple-700 text-white font-bold text-xs rounded-xl"
          >
            Go to SafeHer Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 overflow-hidden flex items-center justify-center">
              <Avatar
                src={journey.traveller_avatar}
                name={journey.traveller_name}
                sizeClass="w-full h-full"
                className="rounded-2xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900">
                  {journey.traveller_name}'s Live Journey
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  {journey.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Shared with authorized trusted family & contacts • Last ping: {lastPollTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {journey.battery_level !== undefined && (
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-600" />
                {journey.battery_level}% Battery
              </span>
            )}
            <a
              href="tel:112"
              className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              Emergency 112
            </a>
          </div>
        </div>

        {/* Route Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Departure</span>
            <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{journey.start_location_name}</span>
          </div>

          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <span className="text-[10px] font-bold text-purple-600 uppercase block">Destination</span>
            <span className="font-extrabold text-purple-900 text-sm mt-0.5 block">{journey.destination_name}</span>
          </div>
        </div>

        {/* Live Map Display */}
        <LiveTrackerMap
          startLat={journey.start_lat}
          startLng={journey.start_lng}
          destLat={journey.dest_lat}
          destLng={journey.dest_lng}
          currentLat={journey.last_lat}
          currentLng={journey.last_lng}
          startName={journey.start_location_name}
          destName={journey.destination_name}
          heightClass="h-[420px]"
        />

        {/* Status footer */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Expected Arrival: {new Date(journey.expected_arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Auto-refreshing every 5 seconds
          </span>
        </div>

      </div>

    </div>
  );
};

