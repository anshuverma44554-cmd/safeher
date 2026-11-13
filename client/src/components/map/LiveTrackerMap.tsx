import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Flag } from 'lucide-react';

const startIcon = L.divIcon({
  className: 'start-marker-icon',
  html: `
    <div style="width: 28px; height: 28px; border-radius: 50%; background: #4f46e5; border: 2.5px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 13px;">
      🟢
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const destIcon = L.divIcon({
  className: 'dest-marker-icon',
  html: `
    <div style="width: 32px; height: 32px; border-radius: 50%; background: #dc2626; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 15px;">
      🏁
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const liveMovingIcon = L.divIcon({
  className: 'live-marker-icon',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(109, 40, 217, 0.4); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 24px; height: 24px; border-radius: 50%; background: #7c3aed; border: 3px solid #ffffff; box-shadow: 0 2px 10px rgba(124,58,237,0.5); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 11px;">
        📍
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapBoundsAdjuster: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
};

// Map Resizer to ensure Leaflet renders correctly when loaded or resized
const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);
  return null;
};

interface LiveTrackerMapProps {
  startLat: number;
  startLng: number;
  destLat: number;
  destLng: number;
  currentLat?: number;
  currentLng?: number;
  startName?: string;
  destName?: string;
  heightClass?: string;
}

export const LiveTrackerMap: React.FC<LiveTrackerMapProps> = ({
  startLat,
  startLng,
  destLat,
  destLng,
  currentLat,
  currentLng,
  startName = 'Departure Point',
  destName = 'Destination',
  heightClass = 'h-[400px]',
}) => {
  const currentPos: [number, number] = [
    currentLat || startLat,
    currentLng || startLng
  ];

  const routePoints: [number, number][] = [
    [startLat, startLng],
    currentPos,
    [destLat, destLng]
  ];

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${heightClass}`}>
      <MapContainer
        center={currentPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '350px' }}
      >
        <MapBoundsAdjuster points={[[startLat, startLng], [destLat, destLng]]} />
        <MapResizer />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          referrerPolicy="strict-origin-when-cross-origin"
        />

        {/* Route Polyline */}
        <Polyline
          positions={[[startLat, startLng], [destLat, destLng]]}
          color="#6d28d9"
          weight={4}
          opacity={0.7}
          dashArray="6, 8"
        />

        {/* Start Marker */}
        <Marker position={[startLat, startLng]} icon={startIcon}>
          <Popup>
            <div className="text-xs p-1">
              <div className="font-bold text-slate-800">Start Location</div>
              <div className="text-slate-500">{startName}</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker */}
        <Marker position={[destLat, destLng]} icon={destIcon}>
          <Popup>
            <div className="text-xs p-1">
              <div className="font-bold text-red-600">Destination</div>
              <div className="text-slate-500">{destName}</div>
            </div>
          </Popup>
        </Marker>

        {/* Live Moving Position */}
        <Marker position={currentPos} icon={liveMovingIcon}>
          <Popup>
            <div className="text-xs p-1">
              <div className="font-bold text-purple-700 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Live Position Broadcast
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Updated in real-time
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

