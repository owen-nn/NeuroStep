import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X, ChevronDown, ChevronUp, CircleCheck, CircleX,
  Cpu, Vibrate, Smartphone, Plus, RefreshCw,
} from 'lucide-react-native';
import { batteryColor } from '../constants/colors';
import { useAppState }  from '../context/AppStateContext';
import { useColors }    from '../context/ThemeContext';

type Props = { onClose: () => void };

type DeviceType = 'hub' | 'vibration' | 'phone';

interface DeviceConfig {
  id:        string;
  type:      DeviceType;
  name:      string;
  model:     string;
  connected: boolean;
  battery?:  number;
  active:    boolean;
}

type Intensity = 'low' | 'medium' | 'high';
const INTENSITIES: Intensity[] = ['low', 'medium', 'high'];

// ── Intensity track ─────────────────────────────────────────────────────────

function IntensityTrack({ value, onChange, disabled }: {
  value:    Intensity;
  onChange: (v: Intensity) => void;
  disabled?: boolean;
}) {
  const C = useColors();
  return (
    <View style={st.wrapper}>
      <View style={[st.trackLine, { backgroundColor: C.border }, disabled && { opacity: 0.3 }]} />
      <View style={st.nodesRow}>
        {INTENSITIES.map((s) => {
          const selected = value === s;
          return (
            <TouchableOpacity
              key={s}
              style={st.nodeContainer}
              onPress={() => !disabled && onChange(s)}
              activeOpacity={disabled ? 1 : 0.7}
            >
              <View style={[
                st.node,
                { backgroundColor: C.surfaceRaised, borderColor: C.border },
                selected && !disabled && { backgroundColor: C.sage, borderColor: C.sage, transform: [{ scale: 1.1 }] },
                disabled && { opacity: 0.35 },
              ]} />
              <Text style={[
                st.nodeLabel,
                { color: C.textMuted },
                selected && !disabled && { color: C.sage },
                disabled && { opacity: 0.35 },
              ]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Device icon ─────────────────────────────────────────────────────────────

function DeviceIcon({ type, color, size = 28 }: { type: DeviceType; color: string; size?: number }) {
  switch (type) {
    case 'hub':       return <Cpu        size={size} color={color} />;
    case 'vibration': return <Vibrate    size={size} color={color} />;
    case 'phone':     return <Smartphone size={size} color={color} />;
  }
}

// ── Expandable device card ──────────────────────────────────────────────────

function DeviceCard({ device, isExpanded, onToggleExpand, onToggleActive }: {
  device:         DeviceConfig;
  isExpanded:     boolean;
  onToggleExpand: () => void;
  onToggleActive: (id: string, active: boolean) => void;
}) {
  const C = useColors();
  const [intensity, setIntensity] = useState<Intensity>('medium');

  const DEVICE_COLOR: Record<DeviceType, string> = {
    hub: C.sage, vibration: C.teal, phone: C.lavender,
  };
  const accent     = DEVICE_COLOR[device.type];
  const canControl = device.connected && device.type !== 'hub';
  const stubAlert  = (msg: string) => Alert.alert('Coming Soon', msg, [{ text: 'OK' }]);

  return (
    <View style={[dc.card, { backgroundColor: C.surface, borderLeftColor: device.connected ? accent : C.border }]}>
      <TouchableOpacity style={dc.header} onPress={onToggleExpand} activeOpacity={0.8}>
        <View style={[dc.iconWrap, { backgroundColor: accent + '22' }]}>
          <DeviceIcon type={device.type} color={device.connected ? accent : C.textMuted} />
        </View>

        <View style={dc.info}>
          <Text style={[dc.name, { color: C.textPrimary }]}>{device.name}</Text>
          <View style={dc.statusRow}>
            {device.connected
              ? <CircleCheck size={13} color={C.sage} />
              : <CircleX     size={13} color={C.clay} />}
            <Text style={[dc.statusText, { color: device.connected ? C.sage : C.clay }]}>
              {device.connected ? 'Connected' : 'Not Connected'}
            </Text>
            {device.battery !== undefined && device.connected && (
              <Text style={[dc.battery, { color: batteryColor(device.battery, C) }]}>
                · {device.battery}%
              </Text>
            )}
            {device.type === 'phone' && (
              <Text style={[dc.statusText, { color: C.textMuted }]}>  · Always available</Text>
            )}
          </View>
          <Text style={[dc.model, { color: C.textMuted }]}>{device.model}</Text>
        </View>

        <View style={dc.chevron}>
          {isExpanded
            ? <ChevronUp   size={18} color={C.textMuted} />
            : <ChevronDown size={18} color={C.textMuted} />}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={dc.expanded}>
          <View style={[dc.expandDivider, { backgroundColor: C.separator }]} />

          {/* Output devices: active toggle */}
          {device.type !== 'hub' && (
            <View style={dc.settingRow}>
              <View style={dc.settingLabel}>
                <Text style={[dc.settingTitle, { color: C.textPrimary }]}>
                  {device.type === 'phone' ? 'Phone Fallback' : 'Use as Primary Output'}
                </Text>
                <Text style={[dc.settingSubtitle, { color: C.textMuted }]}>
                  {device.type === 'phone'
                    ? 'Phone vibrates when no other output device is active'
                    : 'Delivers vibration cues during freeze events'}
                </Text>
              </View>
              <Switch
                value={device.active}
                onValueChange={(val) => onToggleActive(device.id, val)}
                disabled={!device.connected && device.type !== 'phone'}
                trackColor={{ false: C.border, true: C.sage }}
                thumbColor={C.textPrimary}
                ios_backgroundColor={C.border}
              />
            </View>
          )}

          {/* Hub: connection info */}
          {device.type === 'hub' && (
            <>
              <View style={dc.settingRow}>
                <Text style={[dc.settingTitle, { color: C.textPrimary }]}>Firmware</Text>
                <Text style={[dc.settingValue, { color: C.textSecondary }]}>v1.2.0</Text>
              </View>
              <View style={[dc.rowDivider, { backgroundColor: C.separator }]} />
              <View style={dc.settingRow}>
                <Text style={[dc.settingTitle, { color: C.textPrimary }]}>Signal Strength</Text>
                <Text style={[dc.settingValue, { color: C.sage }]}>Strong (−58 dBm)</Text>
              </View>
              <View style={[dc.rowDivider, { backgroundColor: C.separator }]} />
              <TouchableOpacity
                style={[dc.actionBtn, { backgroundColor: C.surfaceRaised, borderColor: C.border }]}
                onPress={() => stubAlert('IMU calibration coming in Phase 3.')}
                activeOpacity={0.7}
              >
                <RefreshCw size={15} color={C.sage} />
                <Text style={[dc.actionBtnLabel, { color: C.sage }]}>Calibrate IMU Sensor</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Vibration: intensity + test */}
          {device.type === 'vibration' && device.active && device.connected && (
            <>
              <View style={[dc.rowDivider, { backgroundColor: C.separator }]} />
              <Text style={[dc.settingTitle, { color: C.textPrimary }]}>Vibration Intensity</Text>
              <IntensityTrack value={intensity} onChange={setIntensity} disabled={!canControl} />
              <View style={[dc.rowDivider, { backgroundColor: C.separator }]} />
              <TouchableOpacity
                style={[dc.actionBtn, { backgroundColor: C.surfaceRaised, borderColor: C.border }]}
                onPress={() => Alert.alert('Test', 'Vibration cue sent to device.', [{ text: 'OK' }])}
                activeOpacity={0.7}
              >
                <Vibrate size={15} color={C.teal} />
                <Text style={[dc.actionBtnLabel, { color: C.teal }]}>Test Vibration</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Phone: intensity */}
          {device.type === 'phone' && device.active && (
            <>
              <View style={[dc.rowDivider, { backgroundColor: C.separator }]} />
              <Text style={[dc.settingTitle, { color: C.textPrimary }]}>Phone Vibration Intensity</Text>
              <IntensityTrack value={intensity} onChange={setIntensity} />
            </>
          )}

          {/* Not connected — reconnect */}
          {!device.connected && device.type !== 'phone' && (
            <>
              <View style={[dc.rowDivider, { backgroundColor: C.separator }]} />
              <TouchableOpacity
                style={[dc.actionBtn, { backgroundColor: C.surfaceRaised, borderColor: C.border }]}
                onPress={() => stubAlert('BLE device pairing will be implemented in Phase 3.')}
                activeOpacity={0.7}
              >
                <RefreshCw size={15} color={C.sage} />
                <Text style={[dc.actionBtnLabel, { color: C.sage }]}>Reconnect Device</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────

export default function DevicesScreen({ onClose }: Props) {
  const { bleConnected, ankleBattery } = useAppState();
  const C = useColors();

  const [devices, setDevices] = useState<DeviceConfig[]>([
    {
      id: 'hub', type: 'hub',
      name: 'NeuroStep Hub', model: 'ESP32-S3  ·  Waist Clip',
      connected: bleConnected, battery: 12, active: true,
    },
    {
      id: 'ankle', type: 'vibration',
      name: 'Ankle Vibration Band', model: 'NV-1  ·  Left Ankle',
      connected: bleConnected, battery: ankleBattery, active: true,
    },
    {
      id: 'phone', type: 'phone',
      name: 'Phone Vibration', model: 'Fallback output',
      connected: true, battery: undefined, active: false,
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const toggleActive = (id: string, active: boolean) =>
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) return { ...d, active };
        if (active && d.type !== 'hub' && d.id !== id) return { ...d, active: false };
        return d;
      })
    );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: C.bg }]} edges={['bottom']}>
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: C.surface, borderBottomColor: C.border }]}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <X size={20} color={C.textPrimary} />
        <Text style={[styles.closeBtnLabel, { color: C.textPrimary }]}>Close Devices</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>CONNECTED DEVICES</Text>
        <Text style={[styles.sectionNote, { color: C.textMuted }]}>
          Tap a device to configure it. Only one output device can be active at a time.
          If no output device is active, your phone will vibrate instead.
        </Text>

        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            isExpanded={expandedId === device.id}
            onToggleExpand={() => toggleExpand(device.id)}
            onToggleActive={toggleActive}
          />
        ))}

        <TouchableOpacity
          style={[styles.addDeviceBtn, { backgroundColor: C.surface, borderColor: C.border }]}
          onPress={() => Alert.alert('Add Device', 'Additional device pairing coming in Phase 3.', [{ text: 'OK' }])}
          activeOpacity={0.7}
        >
          <Plus size={18} color={C.sage} />
          <Text style={[styles.addDeviceBtnLabel, { color: C.sage }]}>Add Another Device</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles — layout only, no colors ─────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1 },
  closeBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   16,
    gap:               10,
    borderBottomWidth: 1,
  },
  closeBtnLabel: { fontSize: 16, fontWeight: '700' },
  content:       { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle:  { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6, marginLeft: 4 },
  sectionNote:   { fontSize: 12, lineHeight: 17, marginBottom: 16, marginLeft: 4 },
  addDeviceBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   14,
    paddingVertical: 16,
    gap:            10,
    marginTop:       4,
    borderWidth:     1,
    borderStyle:    'dashed',
  },
  addDeviceBtnLabel: { fontSize: 15, fontWeight: '600' },
});

const dc = StyleSheet.create({
  card:        { borderRadius: 16, borderLeftWidth: 4, marginBottom: 12, overflow: 'hidden' },
  header:      { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  iconWrap:    { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info:        { flex: 1, gap: 3 },
  name:        { fontSize: 16, fontWeight: '700' },
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusText:  { fontSize: 12, fontWeight: '600' },
  battery:     { fontSize: 12, fontWeight: '600' },
  model:       { fontSize: 11, marginTop: 1 },
  chevron:     { padding: 4 },
  expanded:    { paddingHorizontal: 16, paddingBottom: 16 },
  expandDivider: { height: StyleSheet.hairlineWidth, marginBottom: 14 },
  rowDivider:    { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  settingRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settingLabel:  { flex: 1 },
  settingTitle:  { fontSize: 14, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  settingValue:  { fontSize: 14, fontWeight: '600' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, paddingVertical: 12, gap: 8, borderWidth: 1,
  },
  actionBtnLabel: { fontSize: 14, fontWeight: '600' },
});

const st = StyleSheet.create({
  wrapper:       { paddingTop: 14, paddingBottom: 4 },
  trackLine:     { position: 'absolute', top: 31, left: '16%', right: '16%', height: 4, borderRadius: 2 },
  nodesRow:      { flexDirection: 'row', justifyContent: 'space-between' },
  nodeContainer: { flex: 1, alignItems: 'center', gap: 7 },
  node:          { width: 32, height: 32, borderRadius: 16, borderWidth: 2 },
  nodeLabel:     { fontSize: 12, fontWeight: '600' },
});
