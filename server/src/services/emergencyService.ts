import { db, EmergencyRequest, GuardianProfile } from '../db/database.js';
import { calculateDistanceKm, estimateWalkingTimeMins } from './locationService.js';
import { config } from '../config/env.js';

class EmergencyService {
  private escalationTimeouts = new Map<string, NodeJS.Timeout>();

  public createEmergency(params: {
    travellerId: string;
    latitude: number;
    longitude: number;
    address?: string;
    batteryLevel?: number;
    message?: string;
  }): { emergency: EmergencyRequest; notifiedContactsCount: number; notifiedGuardiansCount: number } {
    // Check if user already has an active emergency
    const existing = db.emergencies.find(
      e => e.traveller_id === params.travellerId && !['resolved', 'cancelled'].includes(e.status)
    );
    if (existing) {
      return {
        emergency: existing,
        notifiedContactsCount: 0,
        notifiedGuardiansCount: 0
      };
    }

    const emergencyId = 'sos_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const traveller = db.profiles.find(p => p.id === params.travellerId);

    const newEmergency: EmergencyRequest = {
      id: emergencyId,
      traveller_id: params.travellerId,
      status: 'created',
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address || 'Location Coordinates: ' + params.latitude.toFixed(4) + ', ' + params.longitude.toFixed(4),
      battery_level: params.batteryLevel,
      message: params.message || 'EMERGENCY SOS: Traveller activated emergency distress beacon.',
      escalation_level: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      activity_log: [
        {
          timestamp: new Date().toISOString(),
          action: 'SOS_TRIGGERED',
          actor: traveller?.full_name || 'Traveller',
          details: `Distress alert generated at coordinates [${params.latitude.toFixed(5)}, ${params.longitude.toFixed(5)}] with battery at ${params.batteryLevel || 'unknown'}%`
        }
      ]
    };

    // 1. Notify Trusted Contacts configured for SOS
    const contacts = db.contacts.filter(c => c.traveller_id === params.travellerId && c.notify_on_sos);
    let notifiedContactsCount = 0;
    contacts.forEach(contact => {
      notifiedContactsCount++;
      newEmergency.activity_log?.push({
        timestamp: new Date().toISOString(),
        action: 'CONTACT_ALERTED',
        actor: 'SafeHer Dispatcher',
        details: `Dispatched SMS & Email alert to trusted contact ${contact.name} (${contact.relationship}) at ${contact.phone}`
      });
    });

    // 2. Discover and notify nearby verified & available guardians
    const eligibleGuardians: Array<{ guardian: GuardianProfile; distanceKm: number }> = [];
    db.guardians.forEach(guardian => {
      if (guardian.verification_status === 'verified' && guardian.is_available && guardian.current_lat && guardian.current_lng) {
        const dist = calculateDistanceKm(params.latitude, params.longitude, guardian.current_lat, guardian.current_lng);
        if (dist <= config.emergency.guardianRadiusKm) {
          eligibleGuardians.push({ guardian, distanceKm: dist });
        }
      }
    });

    // Sort by proximity
    eligibleGuardians.sort((a, b) => a.distanceKm - b.distanceKm);

    eligibleGuardians.forEach(({ guardian, distanceKm }) => {
      db.createNotification(
        guardian.user_id,
        'emergency_alert',
        '🚨 EMERGENCY ALERT NEAR YOU',
        `A solo traveller has triggered an SOS ${distanceKm} km away from your location. Open your Guardian Dashboard to respond.`,
        { emergencyId, latitude: params.latitude, longitude: params.longitude, distanceKm }
      );

      newEmergency.activity_log?.push({
        timestamp: new Date().toISOString(),
        action: 'GUARDIAN_NOTIFIED',
        actor: 'SafeHer Guardian Network',
        details: `Alerted verified guardian ${guardian.city} (${distanceKm} km away)`
      });
    });

    newEmergency.status = 'notified';
    db.emergencies.unshift(newEmergency);
    db.save();

    // 3. Schedule auto-escalation timer
    this.scheduleEscalation(emergencyId);

    db.logActivity(params.travellerId, 'EMERGENCY_CREATED', {
      emergencyId,
      latitude: params.latitude,
      longitude: params.longitude,
      guardiansNotified: eligibleGuardians.length,
      contactsNotified: notifiedContactsCount
    });

    return {
      emergency: newEmergency,
      notifiedContactsCount,
      notifiedGuardiansCount: eligibleGuardians.length
    };
  }

  private scheduleEscalation(emergencyId: string) {
    if (this.escalationTimeouts.has(emergencyId)) {
      clearTimeout(this.escalationTimeouts.get(emergencyId)!);
    }

    const timer = setTimeout(() => {
      this.escalateEmergency(emergencyId);
    }, config.emergency.autoEscalateTimeoutMs);

    this.escalationTimeouts.set(emergencyId, timer);
  }

  public escalateEmergency(emergencyId: string): EmergencyRequest | null {
    const emergency = db.emergencies.find(e => e.id === emergencyId);
    if (!emergency || ['resolved', 'cancelled', 'responding'].includes(emergency.status)) {
      return null;
    }

    emergency.escalation_level = (emergency.escalation_level || 1) + 1;
    emergency.updated_at = new Date().toISOString();
    emergency.activity_log?.push({
      timestamp: new Date().toISOString(),
      action: 'AUTO_ESCALATED',
      actor: 'SafeHer Escalation Engine',
      details: `Level ${emergency.escalation_level} Escalation Triggered: No primary guardian response within timeout. Escalating to regional emergency priority network & notifying admin console.`
    });

    // Notify Traveller
    db.createNotification(
      emergency.traveller_id,
      'emergency_escalated',
      '⚠️ Emergency Escalation Level 2',
      'We have escalated your alert to the regional network. Please stay in a safe, visible public space and call 112 if in direct peril.',
      { emergencyId }
    );

    // Notify all Admins
    const admins = db.profiles.filter(p => p.role === 'admin');
    admins.forEach(admin => {
      db.createNotification(
        admin.id,
        'admin_emergency_escalation',
        '🚨 PRIORITY ALERT: Unacknowledged Emergency SOS',
        `Emergency ${emergencyId} has reached Escalation Level ${emergency.escalation_level}. Immediate administrative review advised.`,
        { emergencyId }
      );
    });

    db.save();
    return emergency;
  }

  public guardianRespond(params: {
    emergencyId: string;
    guardianUserId: string;
    action: 'accept' | 'reject';
    notes?: string;
  }): { success: boolean; emergency?: EmergencyRequest; message: string } {
    const emergency = db.emergencies.find(e => e.id === params.emergencyId);
    if (!emergency) {
      return { success: false, message: 'Emergency request not found.' };
    }

    if (['resolved', 'cancelled'].includes(emergency.status)) {
      return { success: false, message: `Emergency is already ${emergency.status}.` };
    }

    const guardian = db.guardians.find(g => g.user_id === params.guardianUserId);
    if (!guardian) {
      return { success: false, message: 'Guardian profile not found.' };
    }

    if (params.action === 'reject') {
      emergency.activity_log?.push({
        timestamp: new Date().toISOString(),
        action: 'GUARDIAN_DECLINED',
        actor: 'Verified Guardian',
        details: params.notes || 'Guardian currently unable to deploy to location.'
      });
      db.save();
      return { success: true, emergency, message: 'Assistance request declined.' };
    }

    // Accept
    emergency.status = 'accepted';
    emergency.assigned_guardian_id = guardian.id;
    emergency.updated_at = new Date().toISOString();

    // Clear escalation timer since someone has accepted
    if (this.escalationTimeouts.has(params.emergencyId)) {
      clearTimeout(this.escalationTimeouts.get(params.emergencyId)!);
      this.escalationTimeouts.delete(params.emergencyId);
    }

    const dist = guardian.current_lat && guardian.current_lng
      ? calculateDistanceKm(emergency.latitude, emergency.longitude, guardian.current_lat, guardian.current_lng)
      : 1.5;
    const eta = estimateWalkingTimeMins(dist);

    const guardianUser = db.profiles.find(p => p.id === guardian.user_id);

    emergency.activity_log?.push({
      timestamp: new Date().toISOString(),
      action: 'GUARDIAN_ACCEPTED',
      actor: guardianUser?.full_name || 'Verified Guardian',
      details: `Guardian accepted assistance request. Proximity: ${dist} km. Estimated ETA: ${eta} minutes. Contact: ${guardian.emergency_phone}`
    });

    // Notify Traveller
    db.createNotification(
      emergency.traveller_id,
      'guardian_assigned',
      '🛡️ Guardian is Responding!',
      `Verified Guardian ${guardianUser?.full_name} has accepted your distress call and is heading to your location (ETA ~${eta} mins).`,
      { emergencyId: emergency.id, guardianId: guardian.id, eta, phone: guardian.emergency_phone }
    );

    db.save();
    return { success: true, emergency, message: `Emergency accepted. Estimated ETA: ${eta} mins.` };
  }

  public updateStatus(emergencyId: string, status: 'responding' | 'resolved' | 'cancelled', actorName: string, notes?: string): EmergencyRequest | null {
    const emergency = db.emergencies.find(e => e.id === emergencyId);
    if (!emergency) return null;

    emergency.status = status;
    emergency.updated_at = new Date().toISOString();
    if (status === 'resolved') {
      emergency.resolved_at = new Date().toISOString();
    }

    emergency.activity_log?.push({
      timestamp: new Date().toISOString(),
      action: `STATUS_${status.toUpperCase()}`,
      actor: actorName,
      details: notes || `Emergency status updated to ${status}`
    });

    if (this.escalationTimeouts.has(emergencyId)) {
      clearTimeout(this.escalationTimeouts.get(emergencyId)!);
      this.escalationTimeouts.delete(emergencyId);
    }

    db.save();
    return emergency;
  }
}

export const emergencyService = new EmergencyService();

