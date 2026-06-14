// DEV MODE bar — visible only in __DEV__ builds.
// Lets hackathon judges trigger system states without real hardware.
// Phase 3: remove this entirely; real states come from useBLE().

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppState } from '../context/AppStateContext';
import { useColors }  from '../context/ThemeContext';
import { postFreezeEvent, postFallEvent } from '../services/api';

export default function DevToggle() {
  const { systemState, setSystemState } = useAppState();
  const C = useColors();

  if (!__DEV__) return null;

  const handleFreeze = () => {
    setSystemState('freeze');
    postFreezeEvent({ durationMs: 4200, fogConfidence: 0.87, cueDelivered: true }).catch(console.warn);
  };

  return (
    <View style={[styles.bar, { backgroundColor: '#05090D', borderTopColor: C.border }]}>
      <Text style={[styles.devLabel, { color: C.yellow }]}>DEV</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.teal }, systemState === 'freeze' && styles.btnActive]}
          onPress={handleFreeze}
          activeOpacity={0.7}
        >
          <Text style={styles.btnLabel}>FREEZE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.clay }, systemState === 'fall' && styles.btnActive]}
          onPress={() => {
            setSystemState('fall');
            postFallEvent({ severity: 'medium', impactG: 3.2, alertSent: false }).catch(console.warn);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.btnLabel}>FALL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: C.sage }, systemState === 'normal' && styles.btnActive]}
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
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingVertical:   10,
    gap:               10,
    borderTopWidth:     1,
  },
  devLabel: {
    fontWeight:   '700',
    fontSize:     11,
    letterSpacing: 0.8,
    minWidth:      28,
  },
  buttons: {
    flex:          1,
    flexDirection: 'row',
    gap:            8,
  },
  btn: {
    flex:           1,
    paddingVertical: 10,
    borderRadius:   8,
    alignItems:     'center',
    opacity:        0.7,
  },
  btnActive: { opacity: 1 },
  btnLabel: {
    color:        '#FFFFFF',
    fontWeight:   '800',
    fontSize:     12,
    letterSpacing: 0.5,
  },
});
