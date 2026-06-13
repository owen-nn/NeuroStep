// DEV MODE bar — visible only in Expo development builds (__DEV__ === true).
// Lets hackathon judges trigger system states without real hardware.
// Phase 3: remove this entirely; real states come from useBLE().

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppState } from '../context/AppStateContext';

export default function DevToggle() {
  const { systemState, setSystemState } = useAppState();

  if (!__DEV__) return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.devLabel}>⚡ DEV MODE</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnFreeze, systemState === 'freeze' && styles.btnActive]}
          onPress={() => setSystemState('freeze')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnLabel}>FREEZE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnFall, systemState === 'fall' && styles.btnActive]}
          onPress={() => setSystemState('fall')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnLabel}>FALL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnClear, systemState === 'normal' && styles.btnActive]}
          onPress={() => setSystemState('normal')}
          activeOpacity={0.7}
        >
          <Text style={styles.btnLabel}>CLEAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1117',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  devLabel: {
    color: '#F0B429',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
    minWidth: 72,
  },
  buttons: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.75,
  },
  btnActive: {
    opacity: 1,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnFreeze: { backgroundColor: '#0A84FF' },
  btnFall:   { backgroundColor: '#FF3B30' },
  btnClear:  { backgroundColor: '#30D158' },
  btnLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
