// HTTP client for the NeuroStep backend.
// Phase 1: USE_MOCK_DATA is true — all functions return local fixtures.
// Phase 2: set USE_MOCK_DATA = false and fill in the TODO fetch() calls.

import { MOCK_EVENTS, MOCK_MEDICATIONS } from '../constants/mockData';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// Flip to false in Phase 2 once the Vultr backend is live.
export const USE_MOCK_DATA = true;

// ── Freeze / fall events ─────────────────────────────────────────────────────

export async function getFreezeEvents() {
  if (USE_MOCK_DATA) return MOCK_EVENTS.filter((e) => e.type === 'freeze');
  const res = await fetch(`${BASE_URL}/api/events/freeze`);
  return res.json();
}

export async function postFreezeEvent(payload: { durationMs: number; fogConfidence: number }) {
  if (USE_MOCK_DATA) return { ok: true };
  const res = await fetch(`${BASE_URL}/api/events/freeze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getFallEvents() {
  if (USE_MOCK_DATA) return MOCK_EVENTS.filter((e) => e.type === 'fall');
  const res = await fetch(`${BASE_URL}/api/events/fall`);
  return res.json();
}

// ── Medications ──────────────────────────────────────────────────────────────

export async function getMedications() {
  if (USE_MOCK_DATA) return MOCK_MEDICATIONS;
  const res = await fetch(`${BASE_URL}/api/medications`);
  return res.json();
}

export async function markDoseTaken(medicationId: string) {
  if (USE_MOCK_DATA) return { ok: true };
  const res = await fetch(`${BASE_URL}/api/medications/${medicationId}/take`, { method: 'POST' });
  return res.json();
}
