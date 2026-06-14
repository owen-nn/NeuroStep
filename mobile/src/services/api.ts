// HTTP client for the NeuroStep backend.
// Set EXPO_PUBLIC_API_URL in mobile/.env to point at your Vultr server.

import { MOCK_EVENTS, MOCK_MEDICATIONS } from '../constants/mockData';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const USE_MOCK_DATA = false;

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ApiNotification {
  _id:        string;
  category:   'medication' | 'freeze' | 'doctor' | 'device';
  title:      string;
  body:       string;
  occurredAt: string;
  isRead:     boolean;
}

export interface ApiFreezeEvent {
  _id:           string;
  occurredAt:    string;
  durationMs:    number;
  fogConfidence: number;
  cueDelivered:  boolean;
}

export interface ApiMedication {
  _id:      string;
  name:     string;
  doseMg:   number;
  schedule: string[];
  active:   boolean;
}

// ── Notifications ──────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<ApiNotification[]> {
  if (USE_MOCK_DATA) return [];
  const res = await fetch(`${BASE_URL}/api/notifications`);
  if (!res.ok) throw new Error(`GET /api/notifications failed: ${res.status}`);
  return res.json();
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await fetch(`${BASE_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function deleteNotification(id: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await fetch(`${BASE_URL}/api/notifications/${id}`, { method: 'DELETE' });
}

// ── Freeze / fall events ───────────────────────────────────────────────────────

export async function getFreezeEvents(): Promise<ApiFreezeEvent[]> {
  if (USE_MOCK_DATA) return MOCK_EVENTS.filter((e) => e.type === 'freeze') as any;
  const res = await fetch(`${BASE_URL}/api/events/freeze`);
  if (!res.ok) throw new Error(`GET /api/events/freeze failed: ${res.status}`);
  return res.json();
}

export async function postFreezeEvent(payload: {
  durationMs: number;
  fogConfidence: number;
  cueDelivered?: boolean;
}): Promise<ApiFreezeEvent> {
  if (USE_MOCK_DATA) return { _id: 'mock', occurredAt: new Date().toISOString(), cueDelivered: true, ...payload };
  const res = await fetch(`${BASE_URL}/api/events/freeze`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /api/events/freeze failed: ${res.status}`);
  return res.json();
}

export async function postFallEvent(payload: {
  severity?: 'low' | 'medium' | 'high';
  impactG?: number;
  alertSent?: boolean;
}): Promise<void> {
  if (USE_MOCK_DATA) return;
  await fetch(`${BASE_URL}/api/events/fall`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
}

export async function getFallEvents() {
  if (USE_MOCK_DATA) return MOCK_EVENTS.filter((e) => e.type === 'fall');
  const res = await fetch(`${BASE_URL}/api/events/fall`);
  if (!res.ok) throw new Error(`GET /api/events/fall failed: ${res.status}`);
  return res.json();
}

// ── Medications ────────────────────────────────────────────────────────────────

export async function getMedications(): Promise<ApiMedication[]> {
  if (USE_MOCK_DATA) return MOCK_MEDICATIONS as any;
  const res = await fetch(`${BASE_URL}/api/medications`);
  if (!res.ok) throw new Error(`GET /api/medications failed: ${res.status}`);
  return res.json();
}

export async function markDoseTaken(medicationId: string): Promise<void> {
  if (USE_MOCK_DATA) return;
  await fetch(`${BASE_URL}/api/medications/${medicationId}/take`, { method: 'POST' });
}
