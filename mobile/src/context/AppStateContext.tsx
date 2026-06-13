import React, { createContext, useContext, useState } from 'react';
import { MOCK_STATS } from '../constants/mockData';

export type SystemState = 'normal' | 'freeze' | 'fall';

interface AppStateValue {
  systemState:       SystemState;
  bleConnected:      boolean;
  ankleBattery:      number;
  hubBattery:        number;
  avgFreezeDuration: number;
  setSystemState:    (s: SystemState) => void;
}

const Ctx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [systemState, setSystemState] = useState<SystemState>('normal');

  return (
    <Ctx.Provider value={{
      systemState,
      bleConnected:      MOCK_STATS.bleConnected,
      ankleBattery:      MOCK_STATS.ankleBattery,
      hubBattery:        MOCK_STATS.hubBattery,
      avgFreezeDuration: MOCK_STATS.avgFreezeDuration,
      setSystemState,
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
