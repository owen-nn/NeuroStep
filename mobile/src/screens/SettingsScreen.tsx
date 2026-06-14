import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet,
  Switch, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X, UserPlus, Siren, HelpCircle, Info,
  Stethoscope, Users, User, Pencil, Trash2, Check,
} from 'lucide-react-native';
import { useColors } from '../context/ThemeContext';
import { useTheme }  from '../context/ThemeContext';
import { useAppState, type Contact } from '../context/AppStateContext';

type Props = { onClose: () => void };

const HOW_TO_STEPS = [
  { step: '1', text: 'Wear the ankle sensor on your left ankle before walking.' },
  { step: '2', text: 'The hub clips to your waist or pocket. Keep it charged.' },
  { step: '3', text: "When a freeze is detected, you'll feel a vibration cue. Step to the rhythm." },
  { step: '4', text: 'If no sensor is connected, your phone will vibrate as a fallback.' },
  { step: '5', text: 'Check the Analytics tab regularly to track your progress.' },
];

function ContactIcon({ type, color }: { type: Contact['type']; color: string }) {
  switch (type) {
    case 'doctor': return <Stethoscope size={22} color={color} />;
    case 'family': return <Users        size={22} color={color} />;
    default:       return <User         size={22} color={color} />;
  }
}

// ── Editable contact card ───────────────────────────────────────────────────

function ContactCard({
  contact,
  onSave,
  onRemove,
}: {
  contact: Contact;
  onSave:  (c: Contact) => void;
  onRemove: (id: string) => void;
}) {
  const C = useColors();
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(contact);

  const iconColor = contact.type === 'doctor' ? C.lavender : C.sage;

  if (!editing) {
    return (
      <TouchableOpacity
        style={[ec.card, { backgroundColor: C.surfaceRaised, borderColor: C.border }]}
        onPress={() => setEditing(true)}
        activeOpacity={0.8}
      >
        <View style={[ec.iconWrap, { backgroundColor: iconColor + '22' }]}>
          <ContactIcon type={contact.type} color={iconColor} />
        </View>
        <View style={ec.info}>
          <Text style={[ec.name, { color: C.textPrimary }]}>{contact.name}</Text>
          <Text style={[ec.detail, { color: C.textSecondary }]}>
            {contact.role}  ·  {contact.phone}
          </Text>
        </View>
        <Pencil size={16} color={C.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[ec.editCard, { backgroundColor: C.surfaceRaised, borderColor: C.sage }]}>
      <TextInput
        style={[ec.input, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bg }]}
        value={draft.name}
        onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
        placeholder="Full name"
        placeholderTextColor={C.textMuted}
        autoCapitalize="words"
      />
      <TextInput
        style={[ec.input, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bg }]}
        value={draft.role}
        onChangeText={(v) => setDraft((d) => ({ ...d, role: v }))}
        placeholder="Role (e.g. Caregiver)"
        placeholderTextColor={C.textMuted}
        autoCapitalize="words"
      />
      <TextInput
        style={[ec.input, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bg }]}
        value={draft.phone}
        onChangeText={(v) => setDraft((d) => ({ ...d, phone: v }))}
        placeholder="Phone number"
        placeholderTextColor={C.textMuted}
        keyboardType="phone-pad"
      />
      <View style={ec.editBtns}>
        <TouchableOpacity
          style={[ec.saveBtn, { backgroundColor: C.sage }]}
          onPress={() => { onSave(draft); setEditing(false); }}
          activeOpacity={0.8}
        >
          <Check size={15} color="#FFFFFF" />
          <Text style={ec.saveBtnLabel}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[ec.cancelBtn, { borderColor: C.border }]}
          onPress={() => { setDraft(contact); setEditing(false); }}
          activeOpacity={0.8}
        >
          <Text style={[ec.cancelBtnLabel, { color: C.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[ec.removeBtn, { borderColor: C.clay + '60' }]}
          onPress={() => onRemove(contact.id)}
          activeOpacity={0.8}
        >
          <Trash2 size={14} color={C.clay} />
          <Text style={[ec.removeBtnLabel, { color: C.clay }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────

const BLANK_DRAFT = { name: '', role: '', phone: '', type: 'family' as Contact['type'] };

export default function SettingsScreen({ onClose }: Props) {
  const C = useColors();
  const { theme, toggleTheme } = useTheme();
  const { contacts, setContacts } = useAppState();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDraft,    setNewDraft]    = useState(BLANK_DRAFT);

  const saveContact = (updated: Contact) =>
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

  const removeContact = (id: string) =>
    setContacts((prev) => prev.filter((c) => c.id !== id));

  const commitAdd = () => {
    if (!newDraft.name.trim() || !newDraft.phone.trim()) {
      Alert.alert('Missing info', 'Please enter at least a name and phone number.');
      return;
    }
    setContacts((prev) => [
      ...prev,
      { ...newDraft, id: Date.now().toString() },
    ]);
    setNewDraft(BLANK_DRAFT);
    setShowAddForm(false);
  };

  const testEmergency = () =>
    Alert.alert(
      'Test Alert Sent',
      'In Phase 2 this sends a real SMS to your emergency contacts.',
      [{ text: 'Got it' }]
    );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: C.bg }]} edges={['bottom']}>
      <TouchableOpacity
        style={[styles.closeBtn, { backgroundColor: C.surface, borderBottomColor: C.border }]}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <X size={20} color={C.textPrimary} />
        <Text style={[styles.closeBtnLabel, { color: C.textPrimary }]}>Close</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Emergency Contacts */}
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>EMERGENCY CONTACTS</Text>
        <Text style={[styles.sectionHint, { color: C.textMuted }]}>Tap a contact to edit or remove</Text>

        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} onSave={saveContact} onRemove={removeContact} />
        ))}

        {showAddForm ? (
          <View style={[ec.editCard, { backgroundColor: C.surfaceRaised, borderColor: C.sage }]}>
            <TextInput
              style={[ec.input, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bg }]}
              value={newDraft.name}
              onChangeText={(v) => setNewDraft((d) => ({ ...d, name: v }))}
              placeholder="Full name"
              placeholderTextColor={C.textMuted}
              autoCapitalize="words"
              autoFocus
            />
            <TextInput
              style={[ec.input, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bg }]}
              value={newDraft.role}
              onChangeText={(v) => setNewDraft((d) => ({ ...d, role: v }))}
              placeholder="Role (e.g. Caregiver)"
              placeholderTextColor={C.textMuted}
              autoCapitalize="words"
            />
            <TextInput
              style={[ec.input, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.bg }]}
              value={newDraft.phone}
              onChangeText={(v) => setNewDraft((d) => ({ ...d, phone: v }))}
              placeholder="Phone number"
              placeholderTextColor={C.textMuted}
              keyboardType="phone-pad"
            />
            <View style={styles.typeRow}>
              {(['family', 'doctor', 'other'] as Contact['type'][]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, {
                    backgroundColor: newDraft.type === t ? C.sage : C.surface,
                    borderColor: newDraft.type === t ? C.sage : C.border,
                  }]}
                  onPress={() => setNewDraft((d) => ({ ...d, type: t }))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeBtnLabel, { color: newDraft.type === t ? '#FFFFFF' : C.textSecondary }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={ec.editBtns}>
              <TouchableOpacity
                style={[ec.saveBtn, { backgroundColor: C.sage }]}
                onPress={commitAdd}
                activeOpacity={0.8}
              >
                <Check size={15} color="#FFFFFF" />
                <Text style={ec.saveBtnLabel}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ec.cancelBtn, { borderColor: C.border }]}
                onPress={() => { setNewDraft(BLANK_DRAFT); setShowAddForm(false); }}
                activeOpacity={0.8}
              >
                <Text style={[ec.cancelBtnLabel, { color: C.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={() => setShowAddForm(true)}
            activeOpacity={0.7}
          >
            <UserPlus size={16} color={C.sage} />
            <Text style={[styles.addBtnLabel, { color: C.sage }]}>Add Emergency Contact</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.emergencyBtn, { backgroundColor: C.clay }]}
          onPress={testEmergency}
          activeOpacity={0.8}
        >
          <Siren size={20} color="#FFFFFF" />
          <Text style={styles.emergencyBtnLabel}>TEST EMERGENCY ALERT</Text>
        </TouchableOpacity>

        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: C.textMuted, marginTop: 28 }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={[styles.settingTitle, { color: C.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.settingSubtitle, { color: C.textMuted }]}>
                {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: C.border, true: C.sage }}
              thumbColor={C.textPrimary}
              ios_backgroundColor={C.border}
            />
          </View>
        </View>

        {/* How to Use */}
        <Text style={[styles.sectionTitle, { color: C.textMuted, marginTop: 28 }]}>HOW TO USE NEUROSTEP</Text>
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          {HOW_TO_STEPS.map((s, i) => (
            <React.Fragment key={s.step}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
              <View style={styles.stepRow}>
                <View style={[styles.stepBadge, { backgroundColor: C.sage + '33' }]}>
                  <Text style={[styles.stepNum, { color: C.sage }]}>{s.step}</Text>
                </View>
                <Text style={[styles.stepText, { color: C.textSecondary }]}>{s.text}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: C.textMuted }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: C.surface }]}>
          <View style={styles.infoRow}>
            <Info size={18} color={C.textSecondary} />
            <View style={styles.infoText}>
              <Text style={[styles.infoLabel, { color: C.textPrimary }]}>NeuroStep</Text>
              <Text style={[styles.infoValue, { color: C.textSecondary }]}>v0.1.0 — Phase 1 (mock data)</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Alert.alert('Help', 'Full documentation coming in Phase 2.', [{ text: 'OK' }])}
            activeOpacity={0.7}
          >
            <HelpCircle size={18} color={C.textSecondary} />
            <Text style={[styles.infoLabel, { color: C.textPrimary, flex: 1 }]}>Help & Support</Text>
            <Text style={[styles.chevron, { color: C.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  closeBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   16,
    gap:               10,
    borderBottomWidth: 1,
  },
  closeBtnLabel: { fontSize: 16, fontWeight: '700' },

  content: { paddingHorizontal: 16, paddingTop: 20 },

  sectionTitle: {
    fontSize:     11,
    fontWeight:   '700',
    letterSpacing: 1,
    marginBottom:  6,
    marginLeft:    4,
  },
  sectionHint: {
    fontSize:    12,
    marginBottom: 10,
    marginLeft:   4,
  },

  card: {
    borderRadius:  16,
    padding:       18,
    marginBottom:  16,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 14 },

  settingRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:             12,
  },
  settingLabel:    { flex: 1 },
  settingTitle:    { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },

  addBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    borderRadius:     12,
    paddingVertical:  14,
    gap:               8,
    marginBottom:     12,
    borderWidth:       1,
    borderStyle:      'dashed',
  },
  addBtnLabel: { fontSize: 15, fontWeight: '600' },

  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeBtnLabel: { fontSize: 13, fontWeight: '600' },

  emergencyBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   14,
    paddingVertical: 18,
    gap:             10,
    marginBottom:    4,
  },
  emergencyBtnLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNum:  { fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },

  infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 15, fontWeight: '600' },
  infoValue: { fontSize: 12, marginTop: 2 },
  chevron:   { fontSize: 20 },
});

const ec = StyleSheet.create({
  card: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   14,
    borderWidth:     1,
    padding:        14,
    marginBottom:   10,
    gap:            12,
  },
  iconWrap: {
    width:          44,
    height:         44,
    borderRadius:   12,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  info:   { flex: 1 },
  name:   { fontSize: 15, fontWeight: '600' },
  detail: { fontSize: 12, marginTop: 2 },

  editCard: {
    borderRadius:  14,
    borderWidth:    1,
    padding:       14,
    marginBottom:  10,
    gap:           10,
  },
  input: {
    borderWidth:   1,
    borderRadius:  10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize:      15,
    fontWeight:    '500',
  },
  editBtns: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  saveBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               6,
    paddingVertical:  11,
    paddingHorizontal: 18,
    borderRadius:     10,
  },
  saveBtnLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  cancelBtn: {
    paddingVertical:  11,
    paddingHorizontal: 18,
    borderRadius:     10,
    borderWidth:       1,
  },
  cancelBtnLabel: { fontSize: 14, fontWeight: '600' },
  removeBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               5,
    paddingVertical:  11,
    paddingHorizontal: 14,
    borderRadius:     10,
    borderWidth:       1,
  },
  removeBtnLabel: { fontSize: 14, fontWeight: '600' },
});
