import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NotifType } from '../constants/mockData';

type Props = {
  id:         string;
  type:       NotifType;
  title:      string;
  body:       string;
  occurredAt: string;
  onMarkRead: (id: string) => void;
  onSnooze:   (id: string) => void;
};

const ACCENT: Record<NotifType, string> = {
  fog:        '#FF9500',
  fall:       '#FF3B30',
  medication: '#007AFF',
  battery:    '#FF9500',
};

const ICON: Record<NotifType, string> = {
  fog:        '❄',
  fall:       '⚠',
  medication: '💊',
  battery:    '🔋',
};

export default function NotificationCard({ id, type, title, body, occurredAt, onMarkRead, onSnooze }: Props) {
  const time = new Date(occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.card, { borderLeftColor: ACCENT[type] }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{ICON[type]}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      <Text style={styles.body}>{body}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnRead]}
          onPress={() => onMarkRead(id)}
          activeOpacity={0.7}
        >
          <Text style={styles.btnReadLabel}>✓  Mark Read</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnSnooze]}
          onPress={() => onSnooze(id)}
          activeOpacity={0.7}
        >
          <Text style={styles.btnSnoozeLabel}>⏱  Snooze</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderLeftWidth: 5,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  time: {
    fontSize: 13,
    color: '#6C6C70',
    marginTop: 2,
  },
  body: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 22,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRead: {
    backgroundColor: '#007AFF',
  },
  btnReadLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  btnSnooze: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  btnSnoozeLabel: {
    color: '#3C3C43',
    fontSize: 16,
    fontWeight: '600',
  },
});
