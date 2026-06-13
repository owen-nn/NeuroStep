import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import type { SystemState } from '../context/AppStateContext';

type Props = { state: SystemState };

const CFG = {
  normal: { color: '#00C853', label: 'SYSTEM ACTIVE',  sub: 'Walking Smoothly' },
  freeze: { color: '#FF3B30', label: '⚠  FREEZE DETECTED', sub: 'Vibration cue delivered' },
  fall:   { color: '#FF3B30', label: '⚠  FALL DETECTED',   sub: 'Emergency alert sent' },
} as const;

export default function StatusBadge({ state }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const isAlert = state !== 'normal';

  useEffect(() => {
    if (!isAlert) {
      pulse.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.5, duration: 550, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 550, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isAlert]);

  const { color, label, sub } = CFG[state];

  return (
    <Animated.View style={[styles.badge, { backgroundColor: color, opacity: pulse }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    marginHorizontal: 0,
    marginVertical: 12,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  label: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sub: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    textAlign: 'center',
  },
});
