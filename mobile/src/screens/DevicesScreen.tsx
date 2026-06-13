import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Treatment  = 'binaural' | 'metronome';
type Sensitivity = 'low' | 'medium' | 'high';

type Props = { onClose: () => void };

export default function DevicesScreen({ onClose }: Props) {
  const [treatment,      setTreatment]    = useState<Treatment>('binaural');
  const [bpm,            setBpm]           = useState(100);
  const [sensitivity,    setSensitivity]   = useState<Sensitivity>('medium');
  const [fallDetection,  setFallDetection] = useState(true);

  const stubAlert = (msg: string) => Alert.alert('Coming Soon', msg, [{ text: 'OK' }]);

  const adjustBpm = (delta: number) =>
    setBpm((v) => Math.min(160, Math.max(40, v + delta)));

  const testEmergencyAlert = () =>
    Alert.alert(
      '🚨 Test Alert Sent',
      'In Phase 2, this will send a real SMS/push notification to your emergency contacts via the backend.',
      [{ text: 'Got it' }]
    );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* ── Close button ───────────────────────────────────── */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.closeBtnLabel}>✕   Close Settings</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Hardware Status ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>HARDWARE STATUS</Text>
        <View style={styles.card}>
          <HardwareRow
            icon="📟"
            label="Ankle IMU (MPU6050)"
            status="Not Connected"
            connected={false}
            onReconnect={() => stubAlert('BLE hardware pairing will be implemented in Phase 3.')}
          />
          <View style={styles.rowDivider} />
          <HardwareRow
            icon="🎯"
            label="Hub (ESP32-S3)"
            status="Not Connected"
            connected={false}
            onReconnect={() => stubAlert('BLE hardware pairing will be implemented in Phase 3.')}
          />
        </View>

        {/* ── Treatment Type ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>TREATMENT TYPE</Text>
        <View style={[styles.card, styles.row]}>
          <TreatmentPill
            label="🎵 Binaural Beats"
            selected={treatment === 'binaural'}
            onPress={() => setTreatment('binaural')}
          />
          <TreatmentPill
            label="🥁 Metronome"
            selected={treatment === 'metronome'}
            onPress={() => setTreatment('metronome')}
          />
        </View>

        {/* ── BPM Stepper ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>METRONOME BPM</Text>
        <View style={[styles.card, styles.bpmRow]}>
          <TouchableOpacity style={styles.bpmBtn} onPress={() => adjustBpm(-5)} activeOpacity={0.7}>
            <Text style={styles.bpmBtnLabel}>−</Text>
          </TouchableOpacity>
          <View style={styles.bpmDisplay}>
            <Text style={styles.bpmValue}>{bpm}</Text>
            <Text style={styles.bpmUnit}>BPM</Text>
          </View>
          <TouchableOpacity style={styles.bpmBtn} onPress={() => adjustBpm(5)} activeOpacity={0.7}>
            <Text style={styles.bpmBtnLabel}>+</Text>
          </TouchableOpacity>
        </View>

        {/* ── Detection Sensitivity ─────────────────────────── */}
        <Text style={styles.sectionTitle}>DETECTION SENSITIVITY</Text>
        <View style={[styles.card, styles.row, { gap: 8 }]}>
          {(['low', 'medium', 'high'] as Sensitivity[]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sensitivityBtn, sensitivity === s && styles.sensitivityBtnActive]}
              onPress={() => setSensitivity(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sensitivityLabel, sensitivity === s && styles.sensitivityLabelActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Fall Detection toggle ────────────────────────── */}
        <Text style={styles.sectionTitle}>SAFETY</Text>
        <View style={[styles.card, styles.toggleRow]}>
          <View>
            <Text style={styles.toggleLabel}>Fall Detection</Text>
            <Text style={styles.toggleSub}>Alerts caregiver on impact event</Text>
          </View>
          <Switch
            value={fallDetection}
            onValueChange={setFallDetection}
            trackColor={{ false: '#C6C6C8', true: '#34C759' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#C6C6C8"
          />
        </View>

        {/* ── Emergency Contacts ───────────────────────────── */}
        <Text style={styles.sectionTitle}>EMERGENCY CONTACTS</Text>
        <View style={styles.card}>
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>👩‍⚕️</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Dr. Sarah Johnson</Text>
              <Text style={styles.contactDetail}>Caregiver  ·  +1 (555) 234-5678</Text>
            </View>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.contactRow}>
            <Text style={styles.contactIcon}>👨‍👩‍👧</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>Family Member</Text>
              <Text style={styles.contactDetail}>Emergency  ·  +1 (555) 876-5432</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.emergencyBtn} onPress={testEmergencyAlert} activeOpacity={0.8}>
          <Text style={styles.emergencyBtnLabel}>🚨  TEST EMERGENCY ALERT</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function HardwareRow({
  icon, label, status, connected, onReconnect,
}: {
  icon: string; label: string; status: string;
  connected: boolean; onReconnect: () => void;
}) {
  return (
    <View style={hw.row}>
      <Text style={hw.icon}>{icon}</Text>
      <View style={hw.info}>
        <Text style={hw.label}>{label}</Text>
        <Text style={[hw.status, { color: connected ? '#00C853' : '#FF3B30' }]}>
          {connected ? '● ' : '○ '}{status}
        </Text>
      </View>
      <TouchableOpacity style={hw.btn} onPress={onReconnect} activeOpacity={0.7}>
        <Text style={hw.btnLabel}>Reconnect</Text>
      </TouchableOpacity>
    </View>
  );
}

function TreatmentPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[tp.pill, selected && tp.pillActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[tp.label, selected && tp.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#F2F2F7' },

  closeBtn: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  content: { paddingHorizontal: 16, paddingTop: 20 },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6C6C70',
    letterSpacing: 0.8, marginBottom: 8, marginLeft: 4,
  },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  row: { flexDirection: 'row', gap: 10 },

  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginVertical: 14 },

  /* BPM */
  bpmRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bpmBtn:    { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  bpmBtnLabel: { fontSize: 32, fontWeight: '300', color: '#007AFF' },
  bpmDisplay:  { alignItems: 'center' },
  bpmValue:    { fontSize: 48, fontWeight: '800', color: '#1C1C1E' },
  bpmUnit:     { fontSize: 14, color: '#6C6C70', fontWeight: '500', marginTop: -4 },

  /* Sensitivity */
  sensitivityBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#F2F2F7', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  sensitivityBtnActive: { backgroundColor: '#E8F1FF', borderColor: '#007AFF' },
  sensitivityLabel:       { fontSize: 15, fontWeight: '600', color: '#6C6C70' },
  sensitivityLabelActive: { color: '#007AFF' },

  /* Fall detection toggle row */
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  toggleSub:   { fontSize: 13, color: '#6C6C70', marginTop: 2 },

  /* Contacts */
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  contactIcon: { fontSize: 32 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  contactDetail: { fontSize: 13, color: '#6C6C70', marginTop: 2 },

  /* Emergency button */
  emergencyBtn: {
    backgroundColor: '#FF3B30', borderRadius: 16,
    paddingVertical: 20, alignItems: 'center', justifyContent: 'center',
  },
  emergencyBtnLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

const hw = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon:     { fontSize: 28 },
  info:     { flex: 1 },
  label:    { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  status:   { fontSize: 13, fontWeight: '500', marginTop: 3 },
  btn:      { backgroundColor: '#F2F2F7', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#C6C6C8' },
  btnLabel: { fontSize: 14, fontWeight: '600', color: '#007AFF' },
});

const tp = StyleSheet.create({
  pill: {
    flex: 1, paddingVertical: 18, borderRadius: 14,
    backgroundColor: '#F2F2F7', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  pillActive:   { backgroundColor: '#E8F1FF', borderColor: '#007AFF' },
  label:        { fontSize: 15, fontWeight: '600', color: '#6C6C70' },
  labelActive:  { color: '#007AFF' },
});
