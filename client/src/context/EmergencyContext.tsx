import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Emergency } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface EmergencyContextType {
  activeEmergency: Emergency | null;
  assignedGuardian: any | null;
  travellerInfo: any | null;
  isSOSActive: boolean;
  isConfirmModalOpen: boolean;
  incomingAlerts: any[];
  triggerSOS: (params?: { latitude?: number; longitude?: number; address?: string; message?: string }) => Promise<void>;
  cancelSOS: (reason?: string) => Promise<void>;
  resolveSOS: (notes?: string) => Promise<void>;
  respondToEmergency: (id: string, action: 'accept' | 'reject', notes?: string) => Promise<void>;
  refreshEmergency: () => Promise<void>;
  openConfirmModal: () => void;
  closeConfirmModal: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(null);
  const [assignedGuardian, setAssignedGuardian] = useState<any | null>(null);
  const [travellerInfo, setTravellerInfo] = useState<any | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [incomingAlerts, setIncomingAlerts] = useState<any[]>([]);

  const refreshEmergency = useCallback(async () => {
    if (!isAuthenticated) {
      setActiveEmergency(null);
      setAssignedGuardian(null);
      setTravellerInfo(null);
      setIncomingAlerts([]);
      return;
    }

    try {
      const data = await api.getActiveEmergency();
      if (data.success && data.active && data.emergency) {
        setActiveEmergency(data.emergency);
        setAssignedGuardian(data.guardian || null);
        setTravellerInfo(data.traveller || null);
      } else {
        setActiveEmergency(null);
        setAssignedGuardian(null);
        setTravellerInfo(null);
      }

      // If guardian, check for incoming requests
      if (user?.role === 'guardian') {
        const reqs = await api.getAssistanceRequests();
        if (reqs.success) {
          setIncomingAlerts(reqs.requests || []);
        }
      }
    } catch (err) {
      console.warn('Error refreshing emergency status:', err);
    }
  }, [isAuthenticated, user?.role]);

  // Polling for live emergency updates every 4 seconds when authenticated
  useEffect(() => {
    refreshEmergency();
    const interval = setInterval(refreshEmergency, 4000);
    return () => clearInterval(interval);
  }, [refreshEmergency]);

  const triggerSOS = async (params?: { latitude?: number; longitude?: number; address?: string; message?: string }) => {
    // 1. Get browser geolocation or default fallback
    let lat = params?.latitude || 28.6315;
    let lng = params?.longitude || 77.2167;

    if (!params?.latitude && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (err) {
        console.warn('Geolocation failed or permission denied, using last known coordinates.');
      }
    }

    // 2. Battery status if available
    let batteryLevel: number | undefined;
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        batteryLevel = Math.round(battery.level * 100);
      } catch (err) {
        // ignore
      }
    }

    const res = await api.createEmergency({
      latitude: lat,
      longitude: lng,
      address: params?.address,
      batteryLevel,
      message: params?.message,
    });

    if (res.success && res.emergency) {
      setActiveEmergency(res.emergency);
      setIsConfirmModalOpen(false);
    }
  };

  const cancelSOS = async (reason?: string) => {
    if (!activeEmergency) return;
    await api.updateEmergencyStatus(activeEmergency.id, 'cancelled', reason || 'False alarm / Traveller cancelled safely.');
    setActiveEmergency(null);
    setAssignedGuardian(null);
    refreshEmergency();
  };

  const resolveSOS = async (notes?: string) => {
    if (!activeEmergency) return;
    await api.updateEmergencyStatus(activeEmergency.id, 'resolved', notes || 'Emergency assistance completed and verified safe.');
    setActiveEmergency(null);
    setAssignedGuardian(null);
    refreshEmergency();
  };

  const respondToEmergency = async (id: string, action: 'accept' | 'reject', notes?: string) => {
    await api.respondToEmergency(id, action, notes);
    refreshEmergency();
  };

  return (
    <EmergencyContext.Provider
      value={{
        activeEmergency,
        assignedGuardian,
        travellerInfo,
        isSOSActive: Boolean(activeEmergency && !['resolved', 'cancelled'].includes(activeEmergency.status)),
        isConfirmModalOpen,
        incomingAlerts,
        triggerSOS,
        cancelSOS,
        resolveSOS,
        respondToEmergency,
        refreshEmergency,
        openConfirmModal: () => setIsConfirmModalOpen(true),
        closeConfirmModal: () => setIsConfirmModalOpen(false),
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};

