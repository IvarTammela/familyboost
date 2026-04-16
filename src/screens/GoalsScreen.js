import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, categoryMeta, typography, radius, spacing, shadow } from '../theme/colors';
import { useStore } from '../data/store';
import FormModal from '../components/FormModal';
import { TextField, NumberField, CategoryPicker } from '../components/Field';
import CategoryTag from '../components/CategoryTag';
import ProgressBar from '../components/ProgressBar';

function GoalCard({ goal }) {
  const cat = categoryMeta[goal.category];
  const pct = Math.min(100, Math.round((goal.progressDays / goal.periodDays) * 100));
  return (
    <View style={[styles.card, { borderLeftColor: cat.color }]}>
      <CategoryTag categoryKey={goal.category} />
      <Text style={styles.cardTitle}>{goal.challengeTitle}</Text>
      <View style={styles.rewardBox}>
        <Text style={styles.rewardEmoji}>🎁</Text>
        <Text style={styles.rewardText}>{goal.reward}</Text>
      </View>
      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={cat.color} height={10} />
      </View>
      <Text style={styles.progressLabel}>{goal.progressDays}/{goal.periodDays} päeva · {pct}%</Text>
    </View>
  );
}

function StreakRow({ catKey, days }) {
  const cat = categoryMeta[catKey];
  const fiery = days >= 3;
  return (
    <View style={styles.streakRow}>
      <View style={[styles.streakBadge, { backgroundColor: cat.soft }]}>
        <Text style={styles.streakEmoji}>{cat.emoji}</Text>
      </View>
      <Text style={styles.streakLabel}>{cat.label}</Text>
      <View style={[styles.streakCount, days > 0 && { backgroundColor: fiery ? colors.warningSoft : colors.primarySoft }]}>
        <Text style={[styles.streakDays, days === 0 && styles.streakDaysEmpty]}>
          {days > 0 ? `${fiery ? '🔥 ' : ''}${days} p` : '—'}
        </Text>
      </View>
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
            <Text style={styles.pageLabel}>⭐ MINU EDU</Text>
            <Text style={styles.title}>Eesmärgid ja seeriad</Text>
          </View>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Eesmärk</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.streaksCard}>
          <Text style={styles.sectionLabel}>SEERIAD KATEGOORIATE KAUPA</Text>
          {Object.entries(state.streaks).map(([k, v]) => (
            <StreakRow key={k} catKey={k} days={v} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>🎯 Aktiivsed eesmärgid</Text>
        {state.personalGoals.map((g) => (
          <GoalCard key={g.id} goal={g} />
        ))}

        {state.personalGoals.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Pole eesmärke</Text>
            <Text style={styles.emptyText}>
              Sea üks eesmärk, et saada preemia harjumuse kujundamise eest!
            </Text>
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
        <TextField label="Preemia 🎁" value={reward} onChangeText={setReward} placeholder="nt Šokolaad" />
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
  pageLabel: { ...typography.captionStrong, color: colors.primary },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 11,
    borderRadius: radius.pill,
    ...shadow.soft,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', marginLeft: 4 },

  streaksCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, ...shadow.soft,
  },
  sectionLabel: { ...typography.captionStrong, color: colors.textMuted, marginBottom: spacing.md },
  sectionTitle: { ...typography.h1, color: colors.text, marginBottom: spacing.md },

  streakRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  streakBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  streakEmoji: { fontSize: 18 },
  streakLabel: { flex: 1, ...typography.body, color: colors.text, fontWeight: '600' },
  streakCount: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill,
  },
  streakDays: { ...typography.bodyStrong, color: colors.text, fontSize: 13 },
  streakDaysEmpty: { color: colors.textMuted, fontWeight: '500' },

  card: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg,
    marginBottom: spacing.md, borderLeftWidth: 4,
    ...shadow.soft,
  },
  cardTitle: { ...typography.h2, color: colors.text, marginTop: 8, fontSize: 17 },
  rewardBox: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: colors.warningSoft, padding: 10, borderRadius: radius.sm,
  },
  rewardEmoji: { fontSize: 18, marginRight: 8 },
  rewardText: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  progressLabel: { ...typography.caption, color: colors.textMuted, marginTop: 8, fontWeight: '600' },

  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
