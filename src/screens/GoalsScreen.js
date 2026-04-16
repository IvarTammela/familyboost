import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, categoryMeta, typography, radius, spacing } from '../theme/colors';
import { useStore } from '../data/store';
import FormModal from '../components/FormModal';
import { TextField, NumberField, CategoryPicker } from '../components/Field';
import CategoryTag from '../components/CategoryTag';
import ProgressBar from '../components/ProgressBar';

function GoalCard({ goal }) {
  const pct = Math.min(100, Math.round((goal.progressDays / goal.periodDays) * 100));
  return (
    <View style={styles.card}>
      <CategoryTag categoryKey={goal.category} />
      <Text style={styles.cardTitle}>{goal.challengeTitle}</Text>
      <Text style={styles.cardReward}>Preemia: {goal.reward}</Text>
      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={categoryMeta[goal.category].color} />
      </View>
      <Text style={styles.progressLabel}>{goal.progressDays}/{goal.periodDays} päeva · {pct}%</Text>
    </View>
  );
}

function StreakRow({ catKey, days }) {
  const cat = categoryMeta[catKey];
  return (
    <View style={styles.streakRow}>
      <View style={[styles.streakDot, { backgroundColor: cat.color }]} />
      <Text style={styles.streakLabel}>{cat.label}</Text>
      <Text style={[styles.streakDays, days === 0 && styles.streakDaysEmpty]}>
        {days > 0 ? `${days} p` : '—'}
      </Text>
    </View>
  );
}

export default function GoalsScreen() {
  const { state, dispatch } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('self-care');
  const [periodDays, setPeriodDays] = useState('7');
  const [reward, setReward] = useState('');

  const reset = () => { setTitle(''); setCategory('self-care'); setPeriodDays('7'); setReward(''); };
  const canSubmit = title.trim().length > 0 && Number(periodDays) > 0 && reward.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    dispatch({
      type: 'ADD_PERSONAL_GOAL',
      challengeTitle: title.trim(),
      category,
      periodDays: Number(periodDays),
      reward: reward.trim(),
    });
    reset();
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageLabel}>MINU EDU</Text>
            <Text style={styles.title}>Eesmärgid ja seeriad</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Eesmärk</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>SEERIAD KATEGOORIATE KAUPA</Text>
          {Object.entries(state.streaks).map(([k, v]) => (
            <StreakRow key={k} catKey={k} days={v} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Aktiivsed eesmärgid</Text>
        {state.personalGoals.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}

        {state.personalGoals.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Pole eesmärke</Text>
            <Text style={styles.emptyText}>Sea üks eesmärk, et saada preemia harjumuse kujundamise eest</Text>
          </View>
        )}
      </ScrollView>

      <FormModal
        visible={showModal}
        title="Uus isiklik eesmärk"
        onClose={() => { reset(); setShowModal(false); }}
        onSubmit={submit}
        submitDisabled={!canSubmit}
      >
        <TextField label="Ülesanne" value={title} onChangeText={setTitle} placeholder="nt Sokid pesukorvi" />
        <CategoryPicker label="Kategooria" value={category} onChange={setCategory} />
        <NumberField label="Periood (päevades)" value={periodDays} onChangeText={setPeriodDays} placeholder="7" />
        <TextField label="Preemia" value={reward} onChangeText={setReward} placeholder="nt Šokolaad" />
      </FormModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  header: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pageLabel: { ...typography.captionStrong, color: colors.textMuted },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: radius.sm,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', marginLeft: 4 },
  card: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  sectionLabel: { ...typography.captionStrong, color: colors.textMuted, marginBottom: spacing.md },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  streakRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  streakDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.md },
  streakLabel: { flex: 1, ...typography.body, color: colors.text },
  streakDays: { ...typography.bodyStrong, color: colors.text },
  streakDaysEmpty: { color: colors.textMuted, fontWeight: '400' },
  cardTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 17, marginTop: 8 },
  cardReward: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  progressLabel: { ...typography.caption, color: colors.textMuted, marginTop: 6 },
  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
