// Static fixtures for Phase 1. Keep shapes in sync with backend/models/ so
// the Phase 2 API swap requires minimal changes.

// ── Historical event log (used by Analytics + api.ts) ───────────────────────

export interface MockEvent {
  id:             string;
  type:           'freeze' | 'fall';
  occurredAt:     string;
  durationMs?:    number;
  fogConfidence?: number;
  severity?:      'mild' | 'moderate' | 'severe';
}

export const MOCK_EVENTS: MockEvent[] = [
  { id: 'e1', type: 'freeze', occurredAt: '2026-06-13T09:14:00Z', durationMs: 4200, fogConfidence: 0.87 },
  { id: 'e2', type: 'freeze', occurredAt: '2026-06-12T16:33:00Z', durationMs: 2800, fogConfidence: 0.79 },
  { id: 'e3', type: 'fall',   occurredAt: '2026-06-11T11:05:00Z', severity: 'mild' },
  { id: 'e4', type: 'freeze', occurredAt: '2026-06-10T08:50:00Z', durationMs: 6100, fogConfidence: 0.93 },
  { id: 'e5', type: 'freeze', occurredAt: '2026-06-09T14:22:00Z', durationMs: 1900, fogConfidence: 0.71 },
];

// ── Medications (used by api.ts) ─────────────────────────────────────────────

export interface MockMedication {
  id:       string;
  name:     string;
  doseMg:   number;
  schedule: string[];
}

export const MOCK_MEDICATIONS: MockMedication[] = [
  { id: 'm1', name: 'Levodopa / Carbidopa', doseMg: 100, schedule: ['07:00', '13:00', '19:00'] },
  { id: 'm2', name: 'Pramipexole',          doseMg: 0.5, schedule: ['08:00', '20:00'] },
  { id: 'm3', name: 'Amantadine',           doseMg: 100, schedule: ['09:00'] },
];

// ── Live notification feed (HomeScreen cards) ────────────────────────────────

export type NotifType = 'fog' | 'fall' | 'medication' | 'battery';

export interface MockNotification {
  id:         string;
  type:       NotifType;
  title:      string;
  body:       string;
  occurredAt: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1', type: 'medication',
    title: 'Levodopa / Carbidopa',
    body: 'Next dose due at 13:00 — 100 mg',
    occurredAt: '2026-06-13T12:45:00Z',
  },
  {
    id: 'n2', type: 'fog',
    title: 'Freeze Detected Earlier',
    body: '4.2 s episode at 09:14 — vibration cue delivered',
    occurredAt: '2026-06-13T09:14:00Z',
  },
  {
    id: 'n3', type: 'battery',
    title: 'Ankle Sensor Battery Low',
    body: 'Ankle sensor at 15% — please charge before next walk',
    occurredAt: '2026-06-13T08:00:00Z',
  },
  {
    id: 'n4', type: 'medication',
    title: 'Pramipexole',
    body: 'Morning dose due at 08:00 — 0.5 mg',
    occurredAt: '2026-06-13T07:45:00Z',
  },
];

// ── Analytics chart data ─────────────────────────────────────────────────────

export interface WeeklyFreeze { day: string; count: number }
export interface TimeOfDay    { period: string; count: number }

export const MOCK_WEEKLY_FREEZES: WeeklyFreeze[] = [
  { day: 'Mon', count: 2 },
  { day: 'Tue', count: 5 },
  { day: 'Wed', count: 3 },
  { day: 'Thu', count: 1 },
  { day: 'Fri', count: 4 },
  { day: 'Sat', count: 2 },
  { day: 'Sun', count: 3 },
];

export const MOCK_TIME_OF_DAY: TimeOfDay[] = [
  { period: 'Morning',   count: 8 },
  { period: 'Afternoon', count: 5 },
  { period: 'Evening',   count: 3 },
];

// ── Device / system stats (seed for AppStateContext) ────────────────────────

export const MOCK_STATS = {
  avgFreezeDuration: 3.2,  // seconds, shown in bottom dock left half
  ankleBattery:      85,   // percent
  hubBattery:        90,   // percent
  bleConnected:      false, // Phase 3: driven by useBLE()
};
