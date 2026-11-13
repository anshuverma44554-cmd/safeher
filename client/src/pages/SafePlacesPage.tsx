import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Shield,
  Phone,
  Search,
  CheckCircle,
  ExternalLink,
  Navigation,
  Compass,
  Building
} from 'lucide-react';
import { SafePlacesMap } from '../components/map/SafePlacesMap';
import { api } from '../services/api';
import { SafePlace } from '../types';

export const SafePlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [coords, setCoords] = useState<[number, number]>([28.6315, 77.2167]);

  useEffect(() => {
    const fetchAll = async () => {
      const res = await api.getSafePlaces(coords[0], coords[1], category === 'all' ? undefined : category);
      if (res.success) setPlaces(res.places);
    };
    fetchAll();
  }, [category, coords]);

  const filtered = places.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 text-white space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5 text-amber-300" />
          <span>Geospatial Safety Directory & Verified Havens</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Safe Place Finder
        </h1>
        <p className="text-xs sm:text-sm text-purple-200 max-w-2xl leading-relaxed">
          Locate nearest 24/7 women police booths, trauma centers, licensed late-night pharmacies, and SafeHer verified public havens.
        </p>
      </div>

      {/* Map Embed with Full Filters */}
      <SafePlacesMap heightClass="h-[520px]" showFilters={true} initialCenter={coords} />

      {/* Directory Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-slate-900">
            Directory Listing ({filtered.length} Locations)
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            Ranked by proximity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(place => (
            <div
              key={place.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 transition-colors space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    place.category === 'police'
                      ? 'bg-indigo-100 text-indigo-800'
                      : place.category === 'hospital'
                      ? 'bg-red-100 text-red-800'
                      : place.category === 'pharmacy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {place.category.replace('_', ' ')}
                  </span>
                  {place.distance_km !== undefined && (
                    <span className="text-[11px] font-bold text-slate-500">
                      {place.distance_km} km away
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {place.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {place.address}
                </p>

                {place.description && (
                  <p className="text-[11px] text-slate-400 italic">
                    "{place.description}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-700 text-[11px]">
                  {place.open_hours || '24/7 Open'}
                </span>

                {place.phone && (
                  <a
                    href={`tel:${place.phone.split('/')[0].trim()}`}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Helpline</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

