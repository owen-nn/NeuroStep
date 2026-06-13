// Fixed 2-half dock at the bottom of HomeScreen.
// Left half: avg freeze stat → opens Analytics.
// Right half: device connection status → opens Devices.
// NOT a React Navigation tab bar — rendered directly in HomeScreen.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  avgFreezeDuration: number;
  bleConnected:      boolean;
  ankleBattery:      number;
  hubBattery:        number;
  onPressAnalytics:  () => void;
  onPressDevices:    () => void;
};

export default function BottomDock({
  avgFreezeDuration,
  bleConnected,
  ankleBattery,
  hubBattery,
  onPressAnalytics,
  onPressDevices,
}: Props) {
  const connColor = bleConnected ? '#00C853' : '#FF3B30';
  const connLabel = bleConnected ? '● Connected' : '○ No Device';
  const batteryLine = bleConnected
    ? `Ankle ${ankleBattery}%  ·  Hub ${hubBattery}%`
    : 'Tap to pair hardware';

  return (
    <View style={styles.dock}>
      {/* Left half — Analytics */}
      <TouchableOpacity style={[styles.half, styles.leftHalf]} onPress={onPressAnalytics} activeOpacity={0.75}>
        <Text style={styles.statNumber}>{avgFreezeDuration.toFixed(1)}s</Text>
        <Text style={styles.statLabel}>Avg. Freeze{'\n'}Tap for Analytics</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Right half — Devices */}
      <TouchableOpacity style={[styles.half, styles.rightHalf]} onPress={onPressDevices} activeOpacity={0.75}>
        <Text style={[styles.connStatus, { color: connColor }]}>{connLabel}</Text>
        <Text style={styles.batteryLine}>{batteryLine}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    height: 90,
  },
  half: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  leftHalf: {
    borderTopLeftRadius: 0,
  },
  rightHalf: {
    borderTopRightRadius: 0,
  },
  divider: {
    width: 1,
    backgroundColor: '#3A3A3C',
    marginVertical: 14,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 15,
  },
  connStatus: {
    fontSize: 16,
    fontWeight: '700',
  },
  batteryLine: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
});
