import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useColors } from '../context/ThemeContext';

type Props = {
  bleConnected: boolean;
};

export default function StatusBadge({ bleConnected }: Props) {
  const C = useColors();

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderLeftColor: C.sage, marginVertical: 12 }]}>
      <View style={[s.iconCol, { backgroundColor: C.sage + '22' }]}>
        <ShieldCheck size={30} color={C.sage} />
      </View>
      <View style={s.textCol}>
        <Text style={[s.label, { color: C.textPrimary }]}>SYSTEM ACTIVE</Text>
        <Text style={[s.sub, { color: C.textSecondary }]}>Walking Smoothly</Text>
        <Text style={[s.connection, { color: bleConnected ? C.sage : C.textMuted }]}>
          {bleConnected ? '● Ankle & Hub Connected' : '○ No device connected'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection:   'row',
    borderRadius:    16,
    borderLeftWidth: 5,
    overflow:        'hidden',
  },
  iconCol: {
    width:           64,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 20,
  },
  textCol: {
    flex:    1,
    padding: 18,
    gap:     4,
  },
  label: {
    fontSize:    13,
    fontWeight:  '800',
    letterSpacing: 0.6,
  },
  sub: {
    fontSize:   14,
    fontWeight: '500',
  },
  connection: {
    fontSize:   12,
    fontWeight: '600',
    marginTop:   2,
  },
});
