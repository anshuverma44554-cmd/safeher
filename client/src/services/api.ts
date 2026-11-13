import {
  User,
  Guardian,
  Emergency,
  TrustedContact,
  Journey,
  SafePlace,
  AdminStats
} from '../types';

const BASE_URL = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('safeher_token');
  }

  public setToken(token: string) {
    localStorage.setItem('safeher_token', token);
  }

  public removeToken() {
    localStorage.removeItem('safeher_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // AUTH
  public async login(credentials: { email: string; password: string }) {
    const res = await this.request<{
      success: boolean;
      token: string;
      user: User;
      guardian?: Guardian;
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public async register(payload: any) {
    const res = await this.request<{
      success: boolean;
      token: string;
      user: User;
      guardian?: Guardian;
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  public async getMe() {
    return this.request<{
      success: boolean;
      user: User;
      guardian?: Guardian;
    }>('/auth/me');
  }

  // EMERGENCY SOS
  public async createEmergency(data: {
    latitude: number;
    longitude: number;
    address?: string;
    batteryLevel?: number;
    message?: string;
  }) {
    return this.request<{
      success: boolean;
      emergency: Emergency;
      notifiedContactsCount: number;
      notifiedGuardiansCount: number;
      message: string;
    }>('/emergency/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getActiveEmergency() {
    return this.request<{
      success: boolean;
      active: boolean;
      emergency: Emergency | null;
      traveller?: any;
      guardian?: any;
    }>('/emergency/active');
  }

  public async getEmergencyById(id: string) {
    return this.request<{
      success: boolean;
      emergency: Emergency;
      traveller?: any;
      guardian?: any;
    }>(`/emergency/${id}`);
  }

  public async updateEmergencyStatus(id: string, status: 'responding' | 'resolved' | 'cancelled', notes?: string) {
    return this.request<{
      success: boolean;
      emergency: Emergency;
      message: string;
    }>(`/emergency/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  public async respondToEmergency(id: string, action: 'accept' | 'reject', notes?: string) {
    return this.request<{
      success: boolean;
      emergency?: Emergency;
      message: string;
    }>(`/emergency/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    });
  }

  // GUARDIANS
  public async getNearbyGuardians(lat?: number, lng?: number, radius?: number) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    if (radius) params.append('radius', radius.toString());
    return this.request<{
      success: boolean;
      count: number;
      guardians: Guardian[];
    }>(`/guardians/nearby?${params.toString()}`);
  }

  public async applyGuardian(data: any) {
    return this.request<{
      success: boolean;
      guardian: Guardian;
      message: string;
    }>('/guardians/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getMyGuardianProfile() {
    return this.request<{
      success: boolean;
      guardian: Guardian;
    }>('/guardians/me');
  }

  public async toggleGuardianAvailability(is_available?: boolean, latitude?: number, longitude?: number) {
    return this.request<{
      success: boolean;
      is_available: boolean;
      message: string;
    }>('/guardians/availability', {
      method: 'PATCH',
      body: JSON.stringify({ is_available, latitude, longitude }),
    });
  }

  public async getAssistanceRequests() {
    return this.request<{
      success: boolean;
      requests: any[];
    }>('/guardians/requests');
  }

  // JOURNEY
  public async startJourney(data: {
    start_location_name: string;
    start_lat: number;
    start_lng: number;
    destination_name: string;
    dest_lat: number;
    dest_lng: number;
    expected_arrival_time: string;
    battery_level?: number;
  }) {
    return this.request<{
      success: boolean;
      journey: Journey;
      trackingUrl: string;
      message: string;
    }>('/journey/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateJourneyLocation(id: string, latitude: number, longitude: number, battery_level?: number) {
    return this.request<{
      success: boolean;
      updated_at: string;
    }>(`/journey/${id}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, battery_level }),
    });
  }

  public async endJourney(id: string) {
    return this.request<{
      success: boolean;
      journey: Journey;
      message: string;
    }>(`/journey/${id}/end`, {
      method: 'POST',
    });
  }

  public async getActiveJourney() {
    return this.request<{
      success: boolean;
      active: boolean;
      journey: Journey | null;
      trackingUrl: string | null;
    }>('/journey/active');
  }

  public async getSharedJourney(shareToken: string) {
    return this.request<{
      success: boolean;
      journey: Journey;
    }>(`/journey/track/${shareToken}`);
  }

  public async getJourneyHistory() {
    return this.request<{
      success: boolean;
      journeys: Journey[];
    }>('/journey/history');
  }

  // SAFE PLACES
  public async getSafePlaces(lat?: number, lng?: number, category?: string, radius?: number) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lng) params.append('lng', lng.toString());
    if (category) params.append('category', category);
    if (radius) params.append('radius', radius.toString());
    return this.request<{
      success: boolean;
      count: number;
      places: SafePlace[];
    }>(`/safe-places/nearby?${params.toString()}`);
  }

  public async addSafePlace(data: any) {
    return this.request<{
      success: boolean;
      place: SafePlace;
      message: string;
    }>('/safe-places', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // TRUSTED CONTACTS
  public async getContacts() {
    return this.request<{
      success: boolean;
      contacts: TrustedContact[];
    }>('/contacts');
  }

  public async addContact(data: Partial<TrustedContact>) {
    return this.request<{
      success: boolean;
      contact: TrustedContact;
      message: string;
    }>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateContact(id: string, data: Partial<TrustedContact>) {
    return this.request<{
      success: boolean;
      contact: TrustedContact;
      message: string;
    }>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteContact(id: string) {
    return this.request<{
      success: boolean;
      message: string;
    }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // AI SAFETY
  public async chatWithAi(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, currentLocation?: any, isEmergency?: boolean) {
    return this.request<{
      success: boolean;
      response: string;
      isAiGenerated: boolean;
      emergencyTips?: string[];
      model: string;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, currentLocation, isEmergency }),
    });
  }

  public async getQuickPhrases(lang: string = 'hi') {
    return this.request<{
      success: boolean;
      language: string;
      phrases: Array<{ english: string; localized: string; phonetic: string }>;
    }>(`/ai/quick-phrase?lang=${lang}`);
  }

  // ADMIN
  public async getAdminStats() {
    return this.request<{
      success: boolean;
      stats: AdminStats;
    }>('/admin/stats');
  }

  public async getAllGuardians(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request<{
      success: boolean;
      count: number;
      guardians: Guardian[];
    }>(`/admin/guardians${params}`);
  }

  public async verifyGuardian(id: string, status: 'approved' | 'rejected', notes?: string) {
    return this.request<{
      success: boolean;
      guardian: Guardian;
      message: string;
    }>(`/admin/guardians/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  public async getAllEmergencies() {
    return this.request<{
      success: boolean;
      emergencies: any[];
    }>('/admin/emergencies');
  }

  public async getAllUsers() {
    return this.request<{
      success: boolean;
      users: User[];
    }>('/admin/users');
  }

  public async getActivityLogs(limit: number = 50) {
    return this.request<{
      success: boolean;
      logs: any[];
    }>(`/admin/logs?limit=${limit}`);
  }
}

export const api = new ApiClient();

