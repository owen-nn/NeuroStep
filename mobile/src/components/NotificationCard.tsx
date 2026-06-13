import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pill, Snowflake, Stethoscope, Radio, Check } from 'lucide-react-native';
import { useColors } from '../context/ThemeContext';
import type { NotifCategory } from '../constants/mockData';

const ACTIONABLE: NotifCategory[] = ['medication', 'doctor'];

type Props = {
  id:           string;
  category:     NotifCategory;
  title:        string;
  body:         string;
  occurredAt:   string;
  isUnread:     boolean;
  isDone:       boolean;
  onMarkUnread: (id: string) => void;
  onMarkDone:   (id: string) => void;
  onDelete:     (id: string) => void;
};

function CategoryIcon({ category, color }: { category: NotifCategory; color: string }) {
  const size = 18;
  switch (category) {
    case 'medication': return <Pill        size={size} color={color} />;
    case 'freeze':     return <Snowflake   size={size} color={color} />;
    case 'doctor':     return <Stethoscope size={size} color={color} />;
    case 'device':     return <Radio       size={size} color={color} />;
  }
}

function relativeTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationCard({
  id, category, title, body, occurredAt,
  isUnread, isDone, onMarkUnread, onMarkDone, onDelete,
}: Props) {
  const C = useColors();
  const [expanded, setExpanded] = useState(false);

  const ACCENT: Record<NotifCategory, string> = {
    medication: C.amber,
    freeze:     C.clay,
    doctor:     C.lavender,
    device:     C.teal,
  };

  const accent = ACCENT[category];
  const canMarkDone = ACTIONABLE.includes(category);

  const handleTap = () => {
    setExpanded((v) => !v);
    // Auto-mark as read when first opened
    if (isUnread) onMarkUnread(id); // we re-use onMarkUnread as the toggle; caller decides
  };

  return (
    <TouchableOpacity
      style={[
        s.card,
        { backgroundColor: C.surface, borderLeftColor: accent },
        isDone && { opacity: 0.55 },
      ]}
      onPress={handleTap}
      activeOpacity={0.85}
    >
      <View style={s.row}>
        {/* Icon */}
        <View style={[s.iconWrap, { backgroundColor: accent + '28' }]}>
          <CategoryIcon category={category} color={accent} />
          {isDone && (
            <View style={[s.doneBadge, { backgroundColor: C.sage }]}>
              <Check size={8} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={s.content}>
          <View style={s.titleRow}>
            <Text style={[s.title, { color: C.textPrimary }]} numberOfLines={expanded ? undefined : 1}>
              {title}
            </Text>
            {isUnread && !isDone && (
              <View style={[s.unreadDot, { backgroundColor: accent }]} />
            )}
          </View>
          <Text style={[s.time, { color: C.textMuted }]}>{relativeTime(occurredAt)}</Text>
          {expanded && <Text style={[s.body, { color: C.textSecondary }]}>{body}</Text>}
        </View>
      </View>

      {/* Action buttons — shown when expanded */}
      {expanded && (
        <View style={[s.actions, { borderTopColor: C.separator }]}>
          {canMarkDone && !isDone && (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: C.sage + '22', borderColor: C.sage }]}
              onPress={() => onMarkDone(id)}
              activeOpacity={0.75}
            >
              <Check size={13} color={C.sage} />
              <Text style={[s.actionLabel, { color: C.sage }]}>Done</Text>
            </TouchableOpacity>
          )}

          {!isUnread && (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: C.surfaceRaised, borderColor: C.border }]}
              onPress={() => onMarkUnread(id)}
              activeOpacity={0.75}
            >
              <Text style={[s.actionLabel, { color: C.textSecondary }]}>Mark Unread</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: C.clay + '18', borderColor: C.clay + '60' }]}
            onPress={() => onDelete(id)}
            activeOpacity={0.75}
          >
            <Text style={[s.actionLabel, { color: C.clay }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius:    12,
    borderLeftWidth: 4,
    marginBottom:     8,
    overflow:        'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    padding:       14,
  },
  iconWrap: {
    width:          36,
    height:         36,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  doneBadge: {
    position:    'absolute',
    bottom:      -3,
    right:       -3,
    width:       14,
    height:      14,
    borderRadius: 7,
    alignItems:  'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap:  2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            6,
  },
  title: {
    flex:       1,
    fontSize:   14,
    fontWeight: '700',
  },
  unreadDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    flexShrink:   0,
  },
  time: {
    fontSize: 11,
  },
  body: {
    fontSize:   13,
    lineHeight: 18,
    marginTop:   6,
  },
  actions: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:             8,
    paddingHorizontal: 14,
    paddingBottom:  14,
    paddingTop:     10,
    borderTopWidth:  StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:             5,
    paddingVertical:  8,
    paddingHorizontal: 14,
    borderRadius:   20,
    borderWidth:     1,
  },
  actionLabel: {
    fontSize:   13,
    fontWeight: '600',
  },
});
