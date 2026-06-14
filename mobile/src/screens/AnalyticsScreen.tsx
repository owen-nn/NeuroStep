import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, FileText, TrendingDown } from 'lucide-react-native';
import { useColors } from '../context/ThemeContext';
import { getFreezeEvents, type ApiFreezeEvent } from '../services/api';

const CHART_HEIGHT = 110;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TOD_RANGE: Record<string, string> = {
  Morning:   '6am – Noon',
  Afternoon: 'Noon – 6pm',
  Evening:   '6pm – 12am',
};

interface WeeklyFreeze { day: string; count: number }
interface TimeOfDay    { period: string; count: number }

function aggregateByDay(events: ApiFreezeEvent[]): WeeklyFreeze[] {
  const counts: Record<string, number> = {};
  DAYS.forEach((d) => { counts[d] = 0; });
  events.forEach((e) => {
    const day = DAYS[new Date(e.occurredAt).getDay()];
    counts[day] = (counts[day] ?? 0) + 1;
  });
  return DAYS.map((d) => ({ day: d, count: counts[d] }));
}

function aggregateByTimeOfDay(events: ApiFreezeEvent[]): TimeOfDay[] {
  const buckets: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0 };
  events.forEach((e) => {
    const h = new Date(e.occurredAt).getHours();
    if (h >= 6 && h < 12)      buckets.Morning   += 1;
    else if (h >= 12 && h < 18) buckets.Afternoon += 1;
    else if (h >= 18)            buckets.Evening   += 1;
  });
  return Object.entries(buckets).map(([period, count]) => ({ period, count }));
}

type Props = { onClose: () => void };

export default function AnalyticsScreen({ onClose }: Props) {
  const C = useColors();

  const [weeklyFreezes, setWeeklyFreezes] = useState<WeeklyFreeze[]>(DAYS.map((d) => ({ day: d, count: 0 })));
  const [timeOfDay,     setTimeOfDay]     = useState<TimeOfDay[]>([
    { period: 'Morning',   count: 0 },
    { period: 'Afternoon', count: 0 },
    { period: 'Evening',   count: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const events = await getFreezeEvents();
      setWeeklyFreezes(aggregateByDay(events));
      setTimeOfDay(aggregateByTimeOfDay(events));
    } catch (e) {
      console.warn('Failed to load freeze events:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const maxCount  = Math.max(...weeklyFreezes.map((d) => d.count), 1);
  const todTotal  = timeOfDay.reduce((s, d) => s + d.count, 0);
  const totalFreezes = weeklyFreezes.reduce((s, d) => s + d.count, 0);

  const handleSendReport = () =>
    Alert.alert('Send Report', 'Doctor report delivery available in Phase 2.', [{ text: 'OK' }]);

  return (
    <SafeAreaView style={[s.screen, { backgroundColor: C.bg }]} edges={['bottom']}>
      <TouchableOpacity
        style={[s.closeBtn, { backgroundColor: C.surface, borderBottomColor: C.border }]}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <X size={20} color={C.textPrimary} />
        <Text style={[s.closeBtnLabel, { color: C.textPrimary }]}>Close Analytics</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color={C.sage} style={{ marginTop: 48 }} />
      ) : (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

          {/* Insights banner */}
          <View style={[s.headlineCard, { backgroundColor: C.surface, borderLeftColor: C.sage }]}>
            <TrendingDown size={36} color={C.sage} />
            <Text style={[s.headline, { color: C.textPrimary }]}>
              {totalFreezes === 0
                ? 'No freeze episodes this week'
                : `${totalFreezes} freeze episode${totalFreezes === 1 ? '' : 's'} this week`}
            </Text>
            <Text style={[s.headlineSub, { color: C.textSecondary }]}>Keep up the great work</Text>
          </View>

          {/* Weekly bar chart */}
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>FREEZES THIS WEEK</Text>
          <View style={[s.chartCard, { backgroundColor: C.surface }]}>
            <View style={[s.chart, { height: CHART_HEIGHT + 44 }]}>
              {weeklyFreezes.map((d) => {
                const barH = (d.count / maxCount) * CHART_HEIGHT;
                return (
                  <View key={d.day} style={s.barGroup}>
                    <Text style={[s.barCount, { color: C.textSecondary }]}>{d.count}</Text>
                    <View style={[s.barTrack, { height: CHART_HEIGHT }]}>
                      <View style={[s.bar, { height: barH, backgroundColor: C.sage }]} />
                    </View>
                    <Text style={[s.barDay, { color: C.textMuted }]}>{d.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Time of day */}
          <Text style={[s.sectionTitle, { color: C.textMuted }]}>FREEZE PATTERN BY TIME OF DAY</Text>
          <View style={[s.todCard, { backgroundColor: C.surface }]}>
            <Text style={[s.todNote, { color: C.textMuted }]}>
              Freeze frequency often peaks when medication is wearing off — typically in the morning.
            </Text>
            {timeOfDay.map((d) => {
              const pct = todTotal > 0 ? d.count / todTotal : 0;
              return (
                <View key={d.period} style={s.todRow}>
                  <View style={s.todLabelCol}>
                    <Text style={[s.todPeriod, { color: C.textPrimary }]}>{d.period}</Text>
                    <Text style={[s.todRange, { color: C.textMuted }]}>{TOD_RANGE[d.period] ?? ''}</Text>
                  </View>
                  <View style={[s.todTrack, { backgroundColor: C.surfaceRaised }]}>
                    <View style={[s.todFill, { flex: pct, backgroundColor: C.amber }]} />
                    <View style={{ flex: 1 - pct }} />
                  </View>
                  <Text style={[s.todCount, { color: C.textPrimary }]}>{d.count}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[s.reportBtn, { backgroundColor: C.sage }]}
            onPress={handleSendReport}
            activeOpacity={0.8}
          >
            <FileText size={20} color="#FFFFFF" />
            <Text style={s.reportBtnLabel}>Send Report to Doctor</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:   { flex: 1 },
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

  headlineCard: {
    borderRadius:    20,
    padding:         28,
    alignItems:      'center',
    marginBottom:    24,
    gap:             10,
    borderLeftWidth: 4,
  },
  headline:    { fontSize: 20, fontWeight: '800', textAlign: 'center', lineHeight: 28 },
  headlineSub: { fontSize: 14 },

  sectionTitle: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1,
    marginBottom:  10,
    marginLeft:    4,
  },
  chartCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  chart:     { flexDirection: 'row', alignItems: 'flex-end' },
  barGroup:  { flex: 1, alignItems: 'center' },
  barCount:  { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  barTrack:  { justifyContent: 'flex-end', width: '70%' },
  bar:       { borderRadius: 5, width: '100%' },
  barDay:    { fontSize: 11, marginTop: 6, fontWeight: '500' },

  todCard: { borderRadius: 16, padding: 20, marginBottom: 28, gap: 14 },
  todNote: { fontSize: 12, lineHeight: 17, marginBottom: 16, fontStyle: 'italic' },
  todRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  todLabelCol: { width: 94 },
  todPeriod:   { fontSize: 14, fontWeight: '600' },
  todRange:    { fontSize: 10, marginTop: 1 },
  todTrack: {
    flex:          1,
    height:        20,
    borderRadius:  6,
    flexDirection: 'row',
    overflow:      'hidden',
  },
  todFill:  { borderRadius: 6 },
  todCount: { width: 22, fontSize: 14, fontWeight: '700', textAlign: 'right' },

  reportBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    borderRadius:    16,
    paddingVertical: 18,
    gap:             10,
  },
  reportBtnLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
