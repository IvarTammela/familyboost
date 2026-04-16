import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, categoryMeta, typography, radius, spacing, shadow } from '../theme/colors';
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
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyText}>Pole ühtegi ülesannet</Text>
        </View>
      )}

      <View style={{ marginTop: spacing.md }}>
        {Object.entries(groups).map(([cat, items]) => {
          const meta = categoryMeta[cat];
          return (
            <View key={cat} style={styles.group}>
              <View style={[styles.groupHeader, { backgroundColor: meta.soft }]}>
                <Text style={styles.groupEmoji}>{meta.emoji}</Text>
                <Text style={[styles.groupTitle, { color: meta.color }]}>{meta.label}</Text>
                <Text style={[styles.groupCount, { color: meta.color }]}>{items.length}</Text>
              </View>
              {items.map((c) => (
                <View key={c.id} style={styles.item}>
                  <Text style={styles.itemTitle}>{c.title}</Text>
                  {c.source === 'custom' && (
                    <View style={styles.customBadge}>
                      <Text style={styles.customBadgeText}>minu</Text>
                    </View>
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
          <Text style={styles.emptyEmoji}>🌱</Text>
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
              <View style={styles.famPeriodBadge}>
                <Text style={styles.famPeriodText}>{item.periodDays} p</Text>
              </View>
            </View>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardEmoji}>🎁</Text>
              <Text style={styles.rewardText}>{item.reward}</Text>
            </View>
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar value={pct} color={colors.success} height={10} />
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
    { value: 'all', label: '👪 Kogu pere' },
    ...state.family.members.map((m) => ({ value: m.id, label: m.name })),
  ];

  return (
    <FormModal visible title="Lisa pereülesanne" onClose={onCancel} onSubmit={submit} submitDisabled={!canSubmit}>
      <TextField label="Ülesanne" value={title} onChangeText={setTitle} placeholder="nt Pesen nõud kohe peale sööki" />
      <NumberField label="Periood (päevades)" value={periodDays} onChangeText={setPeriodDays} placeholder="7" />
      <TextField label="Preemia 🎁" value={reward} onChangeText={setReward} placeholder="nt Pere SPA-reis" />
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
            <Text style={styles.pageLabel}>📋 ÜLESANDED</Text>
            <Text style={styles.title}>
              {tab === 'personal' ? 'Ülesannete kogu' : 'Pereülesanded'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setOpenForm(tab)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#fff" />
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
  pageLabel: { ...typography.captionStrong, color: colors.primary },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 11,
    borderRadius: radius.pill,
    ...shadow.soft,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', marginLeft: 4 },

  group: { marginBottom: spacing.lg },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm,
  },
  groupEmoji: { fontSize: 16, marginRight: 8 },
  groupTitle: { ...typography.captionStrong, flex: 1 },
  groupCount: { ...typography.captionStrong, opacity: 0.8 },
  item: {
    backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.sm,
    marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center',
  },
  itemTitle: { flex: 1, ...typography.body, color: colors.text, fontWeight: '500' },
  customBadge: {
    backgroundColor: colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radius.pill,
  },
  customBadgeText: {
    ...typography.captionStrong, fontSize: 10, color: colors.accent,
    textTransform: 'uppercase',
  },

  famCard: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg,
    marginBottom: spacing.md, ...shadow.soft,
  },
  famHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  famTitle: { ...typography.h2, color: colors.text, flex: 1 },
  famPeriodBadge: {
    backgroundColor: colors.accentSoft, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  famPeriodText: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  rewardBox: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10,
    backgroundColor: colors.warningSoft, padding: 10, borderRadius: radius.sm,
  },
  rewardEmoji: { fontSize: 18, marginRight: 8 },
  rewardText: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  famPct: { ...typography.caption, color: colors.textMuted, marginTop: 6, fontWeight: '600' },

  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
