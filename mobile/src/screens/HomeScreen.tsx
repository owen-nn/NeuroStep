import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppState }    from '../context/AppStateContext';
import StatusBadge        from '../components/StatusBadge';
import NotificationCard   from '../components/NotificationCard';
import BottomDock         from '../components/BottomDock';
import DevToggle          from '../components/DevToggle';
import { MOCK_NOTIFICATIONS, type MockNotification } from '../constants/mockData';

type Props = {
  onOpenAnalytics: () => void;
  onOpenDevices:   () => void;
};

export default function HomeScreen({ onOpenAnalytics, onOpenDevices }: Props) {
  const { systemState, bleConnected, ankleBattery, hubBattery, avgFreezeDuration } = useAppState();

  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  const [showArchive, setShowArchive] = useState(false);

  // IDs of cards the user has dismissed or snoozed
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [snoozed,   setSnoozed]   = useState<Set<string>>(new Set());

  const active   = notifications.filter((n) => !dismissed.has(n.id) && !snoozed.has(n.id));
  const archived = notifications.filter((n) => dismissed.has(n.id) || snoozed.has(n.id));

  const handleMarkRead = (id: string) => setDismissed((prev) => new Set([...prev, id]));
  const handleSnooze   = (id: string) => setSnoozed((prev)   => new Set([...prev, id]));

  const btIcon = bleConnected ? '🔵' : '◯';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* ── Top bar ───────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>NeuroStep</Text>
        <View style={styles.topRight}>
          <Text style={styles.btIcon}>{btIcon}</Text>
          <Text style={styles.batteryText}>
            Ankle {ankleBattery}%  ·  Hub {hubBattery}%
          </Text>
        </View>
      </View>

      {/* ── Scrollable content ────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusBadge state={systemState} />

        {/* Active notification cards */}
        {active.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyText}>No active alerts — you're doing great!</Text>
          </View>
        )}
        {active.map((n) => (
          <NotificationCard
            key={n.id}
            {...n}
            onMarkRead={handleMarkRead}
            onSnooze={handleSnooze}
          />
        ))}

        {/* Archive / history button */}
        <TouchableOpacity
          style={styles.archiveBtn}
          onPress={() => setShowArchive((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.archiveBtnLabel}>
            {showArchive ? '▲  Hide History' : '▼  View History / Old Notifications'}
            {archived.length > 0 ? `  (${archived.length})` : ''}
          </Text>
        </TouchableOpacity>

        {showArchive && archived.map((n) => (
          <View key={n.id} style={styles.archivedCard}>
            <Text style={styles.archivedTitle}>{n.title}</Text>
            <Text style={styles.archivedBody}>{n.body}</Text>
          </View>
        ))}

        <View style={styles.scrollBottomPad} />
      </ScrollView>

      {/* ── Fixed bottom: dock + DEV bar ──────────────────────── */}
      <BottomDock
        avgFreezeDuration={avgFreezeDuration}
        bleConnected={bleConnected}
        ankleBattery={ankleBattery}
        hubBattery={hubBattery}
        onPressAnalytics={onOpenAnalytics}
        onPressDevices={onOpenDevices}
      />
      <DevToggle />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  /* Top bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btIcon: {
    fontSize: 16,
  },
  batteryText: {
    fontSize: 12,
    color: '#6C6C70',
    fontWeight: '500',
  },

  /* Scroll area */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollBottomPad: {
    height: 12,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 17,
    color: '#6C6C70',
    textAlign: 'center',
  },

  /* Archive button */
  archiveBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  archiveBtnLabel: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },

  /* Archived card (dimmed, no actions) */
  archivedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    opacity: 0.55,
    borderLeftWidth: 4,
    borderLeftColor: '#C6C6C8',
  },
  archivedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  archivedBody: {
    fontSize: 13,
    color: '#6C6C70',
    marginTop: 3,
  },
});
