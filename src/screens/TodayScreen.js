import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, categoryMeta, typography, radius, spacing } from '../theme/colors';
import { useStore } from '../data/store';
import CategoryTag from '../components/CategoryTag';
import ProgressBar from '../components/ProgressBar';
import Segmented from '../components/Segmented';

function formatEstonianDate(d) {
  const days = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
  const months = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
  return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]}`;
}

function ChallengeRow({ item, challenge, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.row} activeOpacity={0.6}>
      <View style={styles.rowLeft}>
        <CategoryTag categoryKey={challenge.category} />
        <Text style={[styles.rowTitle, item.done && styles.rowTitleDone]} numberOfLines={2}>
          {challenge.title}
          {challenge.durationMin ? `  ·  ${challenge.durationMin} min` : ''}
        </Text>
      </View>
      <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
        {item.done && <Ionicons name="checkmark" size={18} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

function FamilyTodayCard({ item, members, currentUserId }) {
  const totalPossible = members.length * item.periodDays;
  const totalDone = Object.values(item.completions).reduce((a, b) => a + b, 0);
  const pct = Math.min(100, Math.round((totalDone / totalPossible) * 100));
  const myDone = item.completions[currentUserId] ?? 0;
  const myComplete = myDone >= item.periodDays;
  return (
    <View style={styles.famCard}>
      <View style={styles.famHeader}>
        <Text style={styles.famTitle}>{item.title}</Text>
        <Text style={styles.famPeriod}>{item.periodDays} päeva</Text>
      </View>
      <Text style={styles.famReward}>Preemia: {item.reward}</Text>
      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={colors.success} />
      </View>
      <View style={styles.famFooter}>
        <Text style={styles.famFooterText}>Pere: {pct}%</Text>
        <Text style={styles.famFooterText}>
          Sinu: {myComplete ? 'valmis' : `${myDone}/${item.periodDays}`}
        </Text>
      </View>
    </View>
  );
}

function PersonalGoalCard({ goal }) {
  const pct = Math.min(100, Math.round((goal.progressDays / goal.periodDays) * 100));
  return (
    <View style={styles.goalCard}>
      <CategoryTag categoryKey={goal.category} />
      <Text style={styles.goalTitle}>{goal.challengeTitle}</Text>
      <Text style={styles.goalReward}>Preemia: {goal.reward}</Text>
      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={categoryMeta[goal.category].color} />
      </View>
      <Text style={styles.goalLabel}>{goal.progressDays}/{goal.periodDays} päeva · {pct}%</Text>
    </View>
  );
}

export default function TodayScreen() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('personal');
  const user = state.family.members.find((m) => m.id === state.currentUserId);
  const today = state.today ?? { items: [] };
  const items = today.items;
  const remaining = items.filter((i) => !i.done).length;

  const bestStreak = useMemo(() => {
    const entries = Object.entries(state.streaks);
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [state.streaks]);

  const myGoals = state.personalGoals.filter(
    (g) => g.status === 'active' && g.ownerId === state.currentUserId
  );
  const activeFam = state.familyChallenges.filter((c) => c.status === 'active');
  const dateLabel = formatEstonianDate(new Date());

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
            <Text style={styles.hello}>Tere, {user?.name}</Text>
          </View>
          {tab === 'personal' && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => dispatch({ type: 'REGENERATE_TODAY' })}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'personal', label: 'Minu' },
            { value: 'family',   label: 'Pere' },
          ]}
        />

        {tab === 'personal' && (
          <>
            <View style={styles.summaryCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>TÄNA</Text>
                <Text style={styles.summaryBig}>{items.length - remaining} / {items.length}</Text>
                <Text style={styles.summarySub}>
                  {remaining === 0 ? 'Kõik tehtud' : `${remaining} ülesannet jäänud`}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.summaryLabel}>PARIM SEERIA</Text>
                <Text style={styles.summaryBig}>{bestStreak?.[1] ?? 0}<Text style={styles.summaryUnit}> p</Text></Text>
                <Text style={styles.summarySub}>
                  {bestStreak && bestStreak[1] > 0 ? categoryMeta[bestStreak[0]].label : '—'}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Tänased väljakutsed</Text>
            {items.map((item) => {
              const challenge = state.challenges.find((c) => c.id === item.challengeId);
              if (!challenge) return null;
              return (
                <ChallengeRow
                  key={item.id}
                  item={item}
                  challenge={challenge}
                  onToggle={() => dispatch({ type: 'TOGGLE_TODAY', id: item.id })}
                />
              );
            })}

            {myGoals.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: spacing['2xl'] }]}>
                  Minu eesmärgid
                </Text>
                {myGoals.map((g) => <PersonalGoalCard key={g.id} goal={g} />)}
              </>
            )}
          </>
        )}

        {tab === 'family' && (
          <>
            <Text style={styles.sectionTitle}>Pereülesanded</Text>
            {activeFam.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Pole aktiivseid pereülesandeid</Text>
                <Text style={styles.emptyText}>Ava Ülesanded → Pereülesanded → + Lisa</Text>
              </View>
            )}
            {activeFam.map((c) => (
              <FamilyTodayCard
                key={c.id}
                item={c}
                members={state.family.members}
                currentUserId={state.currentUserId}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  dateLabel: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  hello: { ...typography.title, color: colors.text, marginTop: 2 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryDivider: {
    width: 1, marginHorizontal: spacing.md, backgroundColor: colors.border,
  },
  summaryLabel: { ...typography.captionStrong, color: colors.textMuted, marginBottom: 4 },
  summaryBig: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  summaryUnit: { fontSize: 16, color: colors.textMuted, fontWeight: '500' },
  summarySub: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: spacing.lg,
    borderRadius: radius.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  rowLeft: { flex: 1, paddingRight: spacing.md },
  rowTitle: { ...typography.bodyStrong, color: colors.text, marginTop: 8 },
  rowTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted, fontWeight: '400' },
  checkbox: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  famCard: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  famHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  famTitle: { ...typography.bodyStrong, color: colors.text, flex: 1 },
  famPeriod: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  famReward: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  famFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  famFooterText: { ...typography.caption, color: colors.textMuted },
  goalCard: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.md,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  goalTitle: { ...typography.bodyStrong, color: colors.text, marginTop: 8 },
  goalReward: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  goalLabel: { ...typography.caption, color: colors.textMuted, marginTop: 6 },
  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
