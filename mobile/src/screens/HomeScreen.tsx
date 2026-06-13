import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings } from 'lucide-react-native';

import { useAppState }   from '../context/AppStateContext';
import { useColors }     from '../context/ThemeContext';
import StatusBadge       from '../components/StatusBadge';
import NotificationCard  from '../components/NotificationCard';
import BottomDock        from '../components/BottomDock';
import DevToggle         from '../components/DevToggle';
import { MOCK_NOTIFICATIONS, type MockNotification, type NotifCategory } from '../constants/mockData';

type Props = {
  onOpenAnalytics: () => void;
  onOpenDevices:   () => void;
  onOpenSettings:  () => void;
};

type FilterTab = NotifCategory | 'all';
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'medication', label: 'Medication' },
  { key: 'freeze',     label: 'Freezes' },
  { key: 'doctor',     label: 'Doctor' },
  { key: 'device',     label: 'Device' },
];

export default function HomeScreen({ onOpenAnalytics, onOpenDevices, onOpenSettings }: Props) {
  const { bleConnected } = useAppState();
  const C = useColors();

  const [notifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  // All notifications start unread; medication/doctor are "actionable"
  const [unreadIds,  setUnreadIds]  = useState<Set<string>>(() => new Set(MOCK_NOTIFICATIONS.map((n) => n.id)));
  const [doneIds,    setDoneIds]    = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setFilter]   = useState<FilterTab>('all');

  const handleMarkUnread = (id: string) =>
    setUnreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);  // toggle: if unread → mark read
      else              next.add(id);     // if read → mark unread
      return next;
    });

  const handleMarkDone = (id: string) => {
    setDoneIds((prev) => new Set([...prev, id]));
    setUnreadIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleDelete = (id: string) =>
    setDeletedIds((prev) => new Set([...prev, id]));

  const visible = notifications.filter((n) => {
    if (deletedIds.has(n.id)) return false;
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  // Count unread per category for filter badges
  const counts = notifications.reduce<Record<FilterTab, number>>(
    (acc, n) => {
      if (!deletedIds.has(n.id) && unreadIds.has(n.id) && !doneIds.has(n.id)) {
        acc.all += 1;
        acc[n.category] = (acc[n.category] ?? 0) + 1;
      }
      return acc;
    },
    { all: 0, medication: 0, freeze: 0, doctor: 0, device: 0 }
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: C.bg }]} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
        <Text style={[styles.appName, { color: C.textPrimary }]}>NeuroStep</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={onOpenSettings}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Settings size={22} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ─────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusBadge bleConnected={bleConnected} />

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}
        >
          {FILTER_TABS.map(({ key, label }) => {
            const count = counts[key];
            const isActive = activeFilter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterPill,
                  { backgroundColor: isActive ? C.sage : C.surfaceRaised },
                ]}
                onPress={() => setFilter(key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterLabel, { color: isActive ? '#FFFFFF' : C.textSecondary }]}>
                  {label}
                </Text>
                {count > 0 && (
                  <View style={[
                    styles.countBadge,
                    { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : C.border },
                  ]}>
                    <Text style={[styles.countText, { color: isActive ? '#FFFFFF' : C.textMuted }]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notifications */}
        {visible.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: C.textMuted }]}>No alerts in this category</Text>
          </View>
        )}
        {visible.map((n) => (
          <NotificationCard
            key={n.id}
            {...n}
            isUnread={unreadIds.has(n.id)}
            isDone={doneIds.has(n.id)}
            onMarkUnread={handleMarkUnread}
            onMarkDone={handleMarkDone}
            onDelete={handleDelete}
          />
        ))}

        <View style={styles.scrollPad} />
      </ScrollView>

      {/* ── Fixed bottom ──────────────────────────────────────── */}
      <BottomDock
        bleConnected={bleConnected}
        onPressAnalytics={onOpenAnalytics}
        onPressDevices={onOpenDevices}
      />
      <DevToggle />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   14,
    borderBottomWidth: 1,
  },
  appName: {
    flex:          1,
    fontSize:      20,
    fontWeight:    '800',
    letterSpacing: -0.3,
  },
  settingsBtn: { padding: 4 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  scrollPad:     { height: 12 },

  filterScroll: { marginBottom: 10 },
  filterRow:    { gap: 8, paddingRight: 4 },
  filterPill: {
    flexDirection:    'row',
    alignItems:       'center',
    borderRadius:     20,
    paddingHorizontal: 14,
    paddingVertical:   7,
    gap:               6,
  },
  filterLabel: { fontSize: 13, fontWeight: '600' },
  countBadge: {
    borderRadius:     8,
    paddingHorizontal: 5,
    paddingVertical:   1,
    minWidth:          18,
    alignItems:        'center',
  },
  countText: { fontSize: 10, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText:  { fontSize: 14 },
});
