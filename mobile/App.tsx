import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertTriangle } from 'lucide-react-native';

import { ThemeProvider, useColors, useTheme } from './src/context/ThemeContext';
import { AppStateProvider, useAppState } from './src/context/AppStateContext';
import HomeScreen      from './src/screens/HomeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import DevicesScreen   from './src/screens/DevicesScreen';
import SettingsScreen  from './src/screens/SettingsScreen';

type ActiveView = 'home' | 'analytics' | 'devices' | 'settings';

// ── Freeze / Fall popup ─────────────────────────────────────────────────────

function FreezeAlertModal() {
  const { systemState, setSystemState } = useAppState();
  const C = useColors();

  const isVisible = systemState === 'freeze' || systemState === 'fall';
  if (!isVisible) return null;

  const isFreeze = systemState === 'freeze';

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={[fa.overlay, { backgroundColor: 'rgba(0,0,0,0.88)' }]}>
        <View style={[fa.card, { backgroundColor: C.surface, borderColor: C.clay }]}>
          <AlertTriangle size={52} color={C.clay} />

          <Text style={[fa.title, { color: C.textPrimary }]}>
            {isFreeze ? 'Freeze Episode' : 'Fall Detected'}
          </Text>

          <Text style={[fa.subtitle, { color: C.clay }]}>Are you okay?</Text>

          <Text style={[fa.desc, { color: C.textSecondary }]}>
            {isFreeze
              ? 'NeuroStep detected a potential walking freeze and delivered a vibration cue to help you continue.'
              : 'NeuroStep detected a potential fall event. Please confirm you are safe.'}
          </Text>

          <TouchableOpacity
            style={[fa.primaryBtn, { backgroundColor: C.sage }]}
            onPress={() => setSystemState('normal')}
            activeOpacity={0.8}
          >
            <Text style={fa.primaryBtnLabel}>I'm Fine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[fa.secondaryBtn, { backgroundColor: C.clay }]}
            onPress={() => Alert.alert('Get Help', 'Emergency alert feature coming in Phase 2.', [{ text: 'OK' }])}
            activeOpacity={0.8}
          >
            <Text style={fa.secondaryBtnLabel}>Get Help</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Main app content ────────────────────────────────────────────────────────

function AppContent() {
  const { theme } = useTheme();
  const C = useColors();
  const [view, setView] = useState<ActiveView>('home');

  const panel = {
    height:            '90%' as const,
    backgroundColor:   C.bg,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    overflow:          'hidden' as const,
  };

  return (
    <AppStateProvider>
      <SafeAreaProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

        <HomeScreen
          onOpenAnalytics={() => setView('analytics')}
          onOpenDevices={() => setView('devices')}
          onOpenSettings={() => setView('settings')}
        />

        {/* Freeze / fall popup — renders above home, below sheet modals */}
        <FreezeAlertModal />

        <Modal visible={view === 'analytics'} animationType="slide" transparent statusBarTranslucent>
          <View style={[sheet.backdrop, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
            <View style={panel}>
              <AnalyticsScreen onClose={() => setView('home')} />
            </View>
          </View>
        </Modal>

        <Modal visible={view === 'devices'} animationType="slide" transparent statusBarTranslucent>
          <View style={[sheet.backdrop, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
            <View style={panel}>
              <DevicesScreen onClose={() => setView('home')} />
            </View>
          </View>
        </Modal>

        <Modal visible={view === 'settings'} animationType="slide" transparent statusBarTranslucent>
          <View style={[sheet.backdrop, { backgroundColor: 'rgba(0,0,0,0.65)' }]}>
            <View style={panel}>
              <SettingsScreen onClose={() => setView('home')} />
            </View>
          </View>
        </Modal>
      </SafeAreaProvider>
    </AppStateProvider>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const sheet = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
});

const fa = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 2,
    marginBottom: 8,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryBtnLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
