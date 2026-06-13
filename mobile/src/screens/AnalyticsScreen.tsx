import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  MOCK_WEEKLY_FREEZES,
  MOCK_TIME_OF_DAY,
  type WeeklyFreeze,
  type TimeOfDay,
} from '../constants/mockData';

const CHART_HEIGHT = 110; // px — height of the bar area

type Props = { onClose: () => void };

export default function AnalyticsScreen({ onClose }: Props) {
  const maxCount  = Math.max(...MOCK_WEEKLY_FREEZES.map((d) => d.count));
  const todTotal  = MOCK_TIME_OF_DAY.reduce((s, d) => s + d.count, 0);

  const handleSendReport = () =>
    Alert.alert('Send Report', 'Doctor report delivery will be available in Phase 2 when the backend is live.', [{ text: 'OK' }]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* ── Close button ────────────────────────────────────── */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.closeBtnLabel}>✕   Close Analytics</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Positive headline */}
        <View style={styles.headlineCard}>
          <Text style={styles.headlineEmoji}>🎉</Text>
          <Text style={styles.headline}>Your freezes are{'\n'}1.5 s shorter this week!</Text>
          <Text style={styles.headlineSub}>Keep up the great work</Text>
        </View>

        {/* ── Weekly bar chart ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>FREEZES THIS WEEK</Text>
        <View style={styles.chartCard}>
          <View style={styles.chart}>
            {MOCK_WEEKLY_FREEZES.map((d: WeeklyFreeze) => {
              const barH = maxCount > 0 ? (d.count / maxCount) * CHART_HEIGHT : 0;
              return (
                <View key={d.day} style={styles.barGroup}>
                  {/* Count label above bar */}
                  <Text style={styles.barCount}>{d.count}</Text>
                  {/* Bar anchored to bottom of chart area */}
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: barH }]} />
                  </View>
                  <Text style={styles.barDay}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Time-of-day distribution ─────────────────────── */}
        <Text style={styles.sectionTitle}>TIME OF DAY</Text>
        <View style={styles.todCard}>
          {MOCK_TIME_OF_DAY.map((d: TimeOfDay) => {
            const pct = todTotal > 0 ? d.count / todTotal : 0;
            return (
              <View key={d.period} style={styles.todRow}>
                <Text style={styles.todPeriod}>{d.period}</Text>
                <View style={styles.todTrack}>
                  <View style={[styles.todFill, { flex: pct }]} />
                  <View style={{ flex: 1 - pct }} />
                </View>
                <Text style={styles.todCount}>{d.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Send report button */}
        <TouchableOpacity style={styles.reportBtn} onPress={handleSendReport} activeOpacity={0.8}>
          <Text style={styles.reportBtnLabel}>📄  Send Report to Doctor</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  /* Close */
  closeBtn: {
    backgroundColor: '#1C1C1E',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  /* Headline */
  headlineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  headlineEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    lineHeight: 30,
  },
  headlineSub: {
    fontSize: 15,
    color: '#6C6C70',
    marginTop: 6,
  },

  /* Section title */
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C6C70',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },

  /* Bar chart */
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 44, // chart area + count label + day label
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
  },
  barCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    width: '70%',
  },
  bar: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    width: '100%',
  },
  barDay: {
    fontSize: 12,
    color: '#6C6C70',
    marginTop: 6,
    fontWeight: '500',
  },

  /* Time of day */
  todCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  todRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todPeriod: {
    width: 90,
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  todTrack: {
    flex: 1,
    height: 22,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  todFill: {
    backgroundColor: '#FF9500',
    borderRadius: 6,
  },
  todCount: {
    width: 24,
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'right',
  },

  /* Report button */
  reportBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtnLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
