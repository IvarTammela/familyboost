import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, categoryMeta, typography, radius, spacing } from '../theme/colors';
import { useStore } from '../data/store';
import FormModal from '../components/FormModal';
import { TextField, NumberField, CategoryPicker, OptionPicker } from '../components/Field';
import Segmented from '../components/Segmented';
import ProgressBar from '../components/ProgressBar';

function PersonalTab() {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');

  const groups = useMemo(() => {
    const filtered = state.challenges.filter((c) => {
      if (filter === 'all') return true;
      if (filter === 'system') return c.source !== 'custom';
      if (filter === 'custom') return c.source === 'custom';
    });
    const byCat = {};
    for (const c of filtered) {
      if (!byCat[c.category]) byCat[c.category] = [];
      byCat[c.category].push(c);
    }
    return byCat;
  }, [state.challenges, filter]);

  return (
    <View>
      <Segmented
        size="sm"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all',    label: 'Kõik' },
          { value: 'system', label: 'Süsteemi' },
          { value: 'custom', label: 'Minu omad' },
        ]}
      />

      {Object.keys(groups).length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Pole ühtegi ülesannet</Text>
        </View>
      )}

      <View style={{ marginTop: spacing.md }}>
        {Object.entries(groups).map(([cat, items]) => {
          const meta = categoryMeta[cat];
          return (
            <View key={cat} style={styles.group}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupDot, { backgroundColor: meta.color }]} />
                <Text style={styles.groupTitle}>{meta.label.toUpperCase()}</Text>
                <Text style={styles.groupCount}>{items.length}</Text>
              </View>
              {items.map((c) => (
                <View key={c.id} style={styles.item}>
                  <Text style={styles.itemTitle}>{c.title}</Text>
                  {c.source === 'custom' && (
                    <Text style={styles.customBadge}>MINU</Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FamilyTab() {
  const { state } = useStore();
  const members = state.family.members;

  return (
    <View>
      {state.familyChallenges.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Pole pereülesandeid</Text>
          <Text style={styles.emptyText}>Vajuta "+ Lisa" et luua esimene</Text>
        </View>
      )}
      {state.familyChallenges.map((item) => {
        const totalPossible = members.length * item.periodDays;
        const totalDone = Object.values(item.completions).reduce((a, b) => a + b, 0);
        const pct = Math.min(100, Math.round((totalDone / totalPossible) * 100));
        return (
          <View key={item.id} style={styles.famCard}>
            <View style={styles.famHeader}>
              <Text style={styles.famTitle}>{item.title}</Text>
              <Text style={styles.famPeriod}>{item.periodDays} päeva</Text>
            </View>
            <Text style={styles.famReward}>Preemia: {item.reward}</Text>
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar value={pct} color={colors.success} />
            </View>
            <Text style={styles.famPct}>{pct}% valmis</Text>
          </View>
        );
      })}
    </View>
  );
}

function PersonalChallengeForm({ state, onSubmitted, onCancel }) {
  const { dispatch } = useStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('movement');
  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const duplicate = state.challenges.some(
      (c) => c.category === category && c.title.trim().toLowerCase() === title.trim().toLowerCase()
    );
    if (duplicate) {
      Alert.alert('Juba olemas', `Selle nimega ülesanne on juba kategoorias "${categoryMeta[category].label}".`);
      return;
    }
    dispatch({ type: 'ADD_CHALLENGE', title: title.trim(), category });
    onSubmitted();
  };

  return (
    <FormModal visible title="Lisa ülesanne" onClose={onCancel} onSubmit={submit} submitDisabled={!canSubmit}>
      <TextField label="Ülesanne" value={title} onChangeText={setTitle} placeholder="nt Loe 10 lehekülge" />
      <CategoryPicker label="Kategooria" value={category} onChange={setCategory} />
    </FormModal>
  );
}

function FamilyChallengeForm({ state, onSubmitted, onCancel }) {
  const { dispatch } = useStore();
  const [title, setTitle] = useState('');
  const [periodDays, setPeriodDays] = useState('7');
  const [reward, setReward] = useState('');
  const [assignedTo, setAssignedTo] = useState('all');

  const canSubmit = title.trim().length > 0 && Number(periodDays) > 0 && reward.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    dispatch({
      type: 'ADD_FAMILY_CHALLENGE',
      title: title.trim(),
      periodDays: Number(periodDays),
      reward: reward.trim(),
      assignedTo,
    });
    onSubmitted();
  };

  const assignOptions = [
    { value: 'all', label: 'Kogu pere' },
    ...state.family.members.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <FormModal visible title="Lisa pereülesanne" onClose={onCancel} onSubmit={submit} submitDisabled={!canSubmit}>
      <TextField label="Ülesanne" value={title} onChangeText={setTitle} placeholder="nt Pesen nõud kohe peale sööki" />
      <NumberField label="Periood (päevades)" value={periodDays} onChangeText={setPeriodDays} placeholder="7" />
      <TextField label="Preemia" value={reward} onChangeText={setReward} placeholder="nt Pere SPA-reis" />
      <OptionPicker label="Kellele?" value={assignedTo} onChange={setAssignedTo} options={assignOptions} />
    </FormModal>
  );
}

export default function ChallengesScreen() {
  const { state } = useStore();
  const [tab, setTab] = useState('personal');
  const [openForm, setOpenForm] = useState(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageLabel}>ÜLESANDED</Text>
            <Text style={styles.title}>
              {tab === 'personal' ? 'Ülesannete kogu' : 'Pereülesanded'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setOpenForm(tab)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Lisa</Text>
          </TouchableOpacity>
        </View>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'personal', label: 'Ülesanded' },
            { value: 'family',   label: 'Pereülesanded' },
          ]}
        />

        <View style={{ marginTop: spacing.lg }}>
          {tab === 'personal' && <PersonalTab />}
          {tab === 'family' && <FamilyTab />}
        </View>
      </ScrollView>

      {openForm === 'personal' && (
        <PersonalChallengeForm
          state={state}
          onSubmitted={() => setOpenForm(null)}
          onCancel={() => setOpenForm(null)}
        />
      )}
      {openForm === 'family' && (
        <FamilyChallengeForm
          state={state}
          onSubmitted={() => setOpenForm(null)}
          onCancel={() => setOpenForm(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  pageLabel: { ...typography.captionStrong, color: colors.textMuted },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.sm,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', marginLeft: 4 },
  group: { marginBottom: spacing.lg },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm,
  },
  groupDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  groupTitle: { ...typography.captionStrong, color: colors.textSecondary, flex: 1 },
  groupCount: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  item: {
    backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.sm,
    marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center',
  },
  itemTitle: { flex: 1, ...typography.body, color: colors.text },
  customBadge: {
    ...typography.captionStrong, fontSize: 10, color: colors.accent,
    backgroundColor: colors.accentSoft, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  famCard: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  famHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  famTitle: { ...typography.h2, color: colors.text, flex: 1 },
  famPeriod: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  famReward: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  famPct: { ...typography.caption, color: colors.textMuted, marginTop: 6 },
  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
