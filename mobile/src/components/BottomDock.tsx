import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BarChart2, Cpu, ChevronUp } from 'lucide-react-native';
import { useColors } from '../context/ThemeContext';

type Props = {
  bleConnected:     boolean;
  onPressAnalytics: () => void;
  onPressDevices:   () => void;
};

export default function BottomDock({ bleConnected, onPressAnalytics, onPressDevices }: Props) {
  const C = useColors();
  const deviceStat      = bleConnected ? 'Ankle & Hub Connected' : 'No Device Paired';
  const deviceStatColor = bleConnected ? C.sage : C.clay;

  return (
    <View style={[styles.dock, { backgroundColor: C.surface, borderTopColor: C.border }]}>
      <TouchableOpacity style={styles.row} onPress={onPressAnalytics} activeOpacity={0.75}>
        <BarChart2 size={22} color={C.sage} />
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: C.textPrimary }]}>Analytics</Text>
        </View>
        <ChevronUp size={18} color={C.textMuted} />
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: C.separator }]} />

      <TouchableOpacity style={styles.row} onPress={onPressDevices} activeOpacity={0.75}>
        <Cpu size={22} color={C.teal} />
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: C.textPrimary }]}>Devices</Text>
          <Text style={[styles.rowStat, { color: deviceStatColor }]}>{deviceStat}</Text>
        </View>
        <ChevronUp size={18} color={C.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    borderTopWidth: 1,
  },
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   16,
    gap:               14,
  },
  rowText: {
    flex: 1,
    gap:   2,
  },
  rowLabel: {
    fontSize:   15,
    fontWeight: '700',
  },
  rowStat: {
    fontSize:   12,
    fontWeight: '500',
  },
  divider: {
    height:            StyleSheet.hairlineWidth,
    marginHorizontal:  20,
  },
});
