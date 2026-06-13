// Phase 1: simple state-based screen routing (no navigator library needed).
// Phase 2: wrap in AuthProvider, switch to React Navigation stack.

import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppStateProvider } from './src/context/AppStateContext';
import HomeScreen      from './src/screens/HomeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import DevicesScreen   from './src/screens/DevicesScreen';

type ActiveView = 'home' | 'analytics' | 'devices';

export default function App() {
  const [view, setView] = useState<ActiveView>('home');

  return (
    <AppStateProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {view === 'home' && (
          <HomeScreen
            onOpenAnalytics={() => setView('analytics')}
            onOpenDevices={() => setView('devices')}
          />
        )}
        {view === 'analytics' && (
          <AnalyticsScreen onClose={() => setView('home')} />
        )}
        {view === 'devices' && (
          <DevicesScreen onClose={() => setView('home')} />
        )}
      </SafeAreaProvider>
    </AppStateProvider>
  );
}
