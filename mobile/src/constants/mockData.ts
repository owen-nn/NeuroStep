// Static fixtures for Phase 1. Keep shapes in sync with backend/models/ so
// the Phase 2 API swap requires minimal changes.

// ── Historical event log ─────────────────────────────────────────────────────

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
  { id: 'e3', type: 'freeze', occurredAt: '2026-06-11T11:05:00Z', durationMs: 3600, fogConfidence: 0.82 },
  { id: 'e4', type: 'freeze', occurredAt: '2026-06-10T08:50:00Z', durationMs: 6100, fogConfidence: 0.93 },
  { id: 'e5', type: 'freeze', occurredAt: '2026-06-09T14:22:00Z', durationMs: 1900, fogConfidence: 0.71 },
];

// ── Medications ──────────────────────────────────────────────────────────────

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

// ── Notifications ────────────────────────────────────────────────────────────
// Categories: medication | freeze | doctor | device
// Note: 'falls' detection is a future feature — no fall-specific entries yet.

export type NotifCategory = 'medication' | 'freeze' | 'doctor' | 'device';

export interface MockNotification {
  id:         string;
  category:   NotifCategory;
  title:      string;
  body:       string;
  occurredAt: string;
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1', category: 'freeze',
    title: 'Freeze Episode Detected',
    body: '4.2 s episode at 09:14 — vibration cue delivered, episode resolved',
    occurredAt: '2026-06-13T09:14:00Z',
  },
  {
    id: 'n2', category: 'medication',
    title: 'Levodopa / Carbidopa Due',
    body: 'Next dose: 1:00 PM — 100 mg. Take with food.',
    occurredAt: '2026-06-13T12:45:00Z',
  },
  {
    id: 'n3', category: 'device',
    title: 'Ankle Sensor Battery Low',
    body: 'Ankle sensor at 15% — please charge before your next walk.',
    occurredAt: '2026-06-13T08:00:00Z',
  },
  {
    id: 'n4', category: 'doctor',
    title: 'Message from Dr. Johnson',
    body: 'Your weekly gait report has been reviewed. Freeze duration trending down — great progress.',
    occurredAt: '2026-06-12T14:30:00Z',
  },
  {
    id: 'n5', category: 'medication',
    title: 'Pramipexole Due',
    body: 'Morning dose: 8:00 AM — 0.5 mg.',
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

// ── Device / system stats ────────────────────────────────────────────────────

export const MOCK_STATS = {
  avgFreezeDuration: 3.2,
  ankleBattery:      85,
  hubBattery:        90,
  bleConnected:      true,  // Phase 3: driven by useBLE()
};
