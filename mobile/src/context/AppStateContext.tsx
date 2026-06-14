import React, { createContext, useContext, useState } from 'react';
import { MOCK_STATS } from '../constants/mockData';

export type SystemState = 'normal' | 'freeze' | 'fall';

export interface Contact {
  id:    string;
  name:  string;
  role:  string;
  phone: string;
  type:  'doctor' | 'family' | 'other';
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: 'c1', type: 'doctor', name: 'Dr. Sarah Johnson', role: 'Caregiver',  phone: '+15552345678' },
  { id: 'c2', type: 'family', name: 'Family Member',     role: 'Emergency',  phone: '+15558765432' },
];

interface AppStateValue {
  systemState:       SystemState;
  bleConnected:      boolean;
  ankleBattery:      number;
  hubBattery:        number;
  avgFreezeDuration: number;
  contacts:          Contact[];
  setSystemState:    (s: SystemState) => void;
  setContacts:       React.Dispatch<React.SetStateAction<Contact[]>>;
}

const Ctx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [systemState, setSystemState] = useState<SystemState>('normal');
  const [contacts,    setContacts]    = useState<Contact[]>(DEFAULT_CONTACTS);

  return (
    <Ctx.Provider value={{
      systemState,
      bleConnected:      MOCK_STATS.bleConnected,
      ankleBattery:      MOCK_STATS.ankleBattery,
      hubBattery:        MOCK_STATS.hubBattery,
      avgFreezeDuration: MOCK_STATS.avgFreezeDuration,
      contacts,
      setSystemState,
      setContacts,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppState(): AppStateValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be called inside AppStateProvider');
  return ctx;
}
