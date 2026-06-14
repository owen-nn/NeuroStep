import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertTriangle, Phone, MessageSquare, ChevronLeft } from 'lucide-react-native';

import { ThemeProvider, useColors, useTheme } from './src/context/ThemeContext';
import { AppStateProvider, useAppState, type Contact } from './src/context/AppStateContext';
import HomeScreen      from './src/screens/HomeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import DevicesScreen   from './src/screens/DevicesScreen';
import SettingsScreen  from './src/screens/SettingsScreen';

type ActiveView = 'home' | 'analytics' | 'devices' | 'settings';

// ── Freeze / Fall popup ─────────────────────────────────────────────────────

function dialPhone(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  Linking.openURL(`tel:${cleaned}`);
}

function textPhone(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  Linking.openURL(`sms:${cleaned}`);
}

function ContactRow({ contact, C }: { contact: Contact; C: ReturnType<typeof useColors> }) {
  return (
    <View style={[fa.contactRow, { borderColor: C.border }]}>
      <View style={fa.contactInfo}>
        <Text style={[fa.contactName, { color: C.textPrimary }]}>{contact.name}</Text>
        <Text style={[fa.contactRole, { color: C.textSecondary }]}>{contact.role}</Text>
      </View>
      <TouchableOpacity
        style={[fa.contactBtn, { backgroundColor: C.sage }]}
        onPress={() => dialPhone(contact.phone)}
        activeOpacity={0.8}
      >
        <Phone size={18} color="#FFFFFF" />
        <Text style={fa.contactBtnLabel}>Call</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[fa.contactBtn, { backgroundColor: C.teal }]}
        onPress={() => textPhone(contact.phone)}
        activeOpacity={0.8}
      >
        <MessageSquare size={18} color="#FFFFFF" />
        <Text style={fa.contactBtnLabel}>Text</Text>
      </TouchableOpacity>
    </View>
  );
}

function FreezeAlertModal() {
  const { systemState, setSystemState, contacts } = useAppState();
  const C = useColors();
  const [showContacts, setShowContacts] = useState(false);

  const isVisible = systemState === 'freeze' || systemState === 'fall';
  if (!isVisible) return null;

  const isFreeze = systemState === 'freeze';

  const dismiss = () => { setSystemState('normal'); setShowContacts(false); };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={[fa.overlay, { backgroundColor: 'rgba(0,0,0,0.88)' }]}>
        <View style={[fa.card, { backgroundColor: C.surface, borderColor: C.clay }]}>

          {showContacts ? (
            <>
              <Text style={[fa.title, { color: C.textPrimary }]}>Get Help</Text>
              <Text style={[fa.desc, { color: C.textSecondary }]}>
                Choose a contact to call or text now.
              </Text>

              {contacts.map((c) => (
                <ContactRow key={c.id} contact={c} C={C} />
              ))}

              <TouchableOpacity
                style={[fa.backBtn, { borderColor: C.border }]}
                onPress={() => setShowContacts(false)}
                activeOpacity={0.8}
              >
                <ChevronLeft size={18} color={C.textSecondary} />
                <Text style={[fa.backBtnLabel, { color: C.textSecondary }]}>Back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
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
                onPress={dismiss}
                activeOpacity={0.8}
              >
                <Text style={fa.primaryBtnLabel}>I'm Fine</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[fa.secondaryBtn, { backgroundColor: C.clay }]}
                onPress={() => setShowContacts(true)}
                activeOpacity={0.8}
              >
                <Text style={fa.secondaryBtnLabel}>Get Help</Text>
              </TouchableOpacity>
            </>
          )}

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

  contactRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '700' },
  contactRole: { fontSize: 12, marginTop: 2 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  contactBtnLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  backBtnLabel: { fontSize: 15, fontWeight: '600' },
});
