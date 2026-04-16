import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, categoryMeta, typography, radius, spacing, shadow } from '../theme/colors';
import { useStore } from '../data/store';
import CategoryTag from '../components/CategoryTag';
import ProgressBar from '../components/ProgressBar';
import Segmented from '../components/Segmented';

function formatEstonianDate(d) {
  const days = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
  const months = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
  return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]}`;
}

function encouragement(done, total) {
  if (total === 0) return 'Alusta päeva!';
  if (done === 0) return 'Lähme täna pihta! 💪';
  if (done === total) return 'Võimas! Kõik tehtud 🎉';
  if (done === total - 1) return 'Üks on veel! Sa suudad 🔥';
  return 'Tubli, jätka samas vaimus ✨';
}

function ChallengeRow({ item, challenge, onToggle }) {
  const cat = categoryMeta[challenge.category];
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.row, item.done && styles.rowDone, { borderLeftColor: cat.color }]}
      activeOpacity={0.6}
    >
      <View style={styles.rowLeft}>
        <CategoryTag categoryKey={challenge.category} />
        <Text style={[styles.rowTitle, item.done && styles.rowTitleDone]} numberOfLines={2}>
          {challenge.title}
          {challenge.durationMin ? `  ·  ${challenge.durationMin} min` : ''}
        </Text>
      </View>
      <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
        {item.done && <Ionicons name="checkmark" size={20} color="#fff" />}
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
        <View style={styles.famPeriodBadge}>
          <Text style={styles.famPeriodText}>{item.periodDays} p</Text>
        </View>
      </View>
      <View style={styles.famRewardBox}>
        <Text style={styles.famRewardEmoji}>🎁</Text>
        <Text style={styles.famReward}>{item.reward}</Text>
      </View>
      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={colors.success} height={10} />
      </View>
      <View style={styles.famFooter}>
        <Text style={styles.famFooterText}>Pere: {pct}%</Text>
        <Text style={[styles.famFooterText, myComplete && styles.famFooterDone]}>
          Sinu: {myComplete ? '✓ valmis' : `${myDone}/${item.periodDays}`}
        </Text>
      </View>
    </View>
  );
}

function PersonalGoalCard({ goal }) {
  const cat = categoryMeta[goal.category];
  const pct = Math.min(100, Math.round((goal.progressDays / goal.periodDays) * 100));
  return (
    <View style={[styles.goalCard, { borderLeftColor: cat.color }]}>
      <CategoryTag categoryKey={goal.category} />
      <Text style={styles.goalTitle}>{goal.challengeTitle}</Text>
      <View style={styles.goalRewardBox}>
        <Text style={styles.goalRewardEmoji}>🎁</Text>
        <Text style={styles.goalReward}>{goal.reward}</Text>
      </View>
      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={cat.color} height={10} />
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
  const done = items.filter((i) => i.done).length;
  const remaining = items.length - done;

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
  const allDone = items.length > 0 && remaining === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>{dateLabel}</Text>
            <Text style={styles.hello}>Tere, {user?.name}! 👋</Text>
          </View>
          {tab === 'personal' && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => dispatch({ type: 'REGENERATE_TODAY' })}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color={colors.primary} />
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
            <View style={[styles.heroCard, allDone && styles.heroCardDone]}>
              <View style={styles.heroTopRow}>
                <Text style={styles.heroEmoji}>{allDone ? '🎉' : '🚀'}</Text>
                <Text style={styles.heroEncouragement}>{encouragement(done, items.length)}</Text>
              </View>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatBig}>{done}<Text style={styles.heroStatSmall}>/{items.length}</Text></Text>
                  <Text style={styles.heroStatLabel}>TÄNA TEHTUD</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatBig}>
                    {bestStreak?.[1] ?? 0}<Text style={styles.heroStatSmall}> p</Text>
                  </Text>
                  <Text style={styles.heroStatLabel}>🔥 PARIM SEERIA</Text>
                </View>
              </View>
              <View style={styles.heroProgress}>
                <ProgressBar
                  value={items.length > 0 ? (done / items.length) * 100 : 0}
                  color="#fff"
                  height={8}
                />
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
                  ⭐ Minu eesmärgid
                </Text>
                {myGoals.map((g) => <PersonalGoalCard key={g.id} goal={g} />)}
              </>
            )}
          </>
        )}

        {tab === 'family' && (
          <>
            <Text style={styles.sectionTitle}>👪 Pereülesanded</Text>
            {activeFam.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🌱</Text>
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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },

  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginVertical: spacing.lg,
    ...shadow.lifted,
  },
  heroCardDone: { backgroundColor: colors.success },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  heroEmoji: { fontSize: 24, marginRight: 8 },
  heroEncouragement: { ...typography.bodyStrong, color: '#fff', fontSize: 16, flex: 1 },
  heroStats: { flexDirection: 'row', marginTop: 4 },
  heroStat: { flex: 1 },
  heroStatBig: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  heroStatSmall: { fontSize: 18, fontWeight: '600', opacity: 0.85 },
  heroStatLabel: { ...typography.captionStrong, color: '#fff', opacity: 0.85, marginTop: 2 },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: spacing.lg },
  heroProgress: { marginTop: spacing.lg },

  sectionTitle: { ...typography.h1, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: spacing.lg,
    borderRadius: radius.lg, marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadow.soft,
  },
  rowDone: { backgroundColor: colors.successSoft },
  rowLeft: { flex: 1, paddingRight: spacing.md },
  rowTitle: { ...typography.bodyStrong, color: colors.text, marginTop: 8, fontSize: 16 },
  rowTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted, fontWeight: '500' },
  checkbox: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: colors.borderStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },

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
  famRewardBox: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: colors.warningSoft, padding: 10, borderRadius: radius.sm,
  },
  famRewardEmoji: { fontSize: 18, marginRight: 8 },
  famReward: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  famFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  famFooterText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  famFooterDone: { color: colors.success, fontWeight: '700' },

  goalCard: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg,
    marginBottom: spacing.md, borderLeftWidth: 4,
    ...shadow.soft,
  },
  goalTitle: { ...typography.h2, color: colors.text, marginTop: 8 },
  goalRewardBox: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: colors.warningSoft, padding: 10, borderRadius: radius.sm,
  },
  goalRewardEmoji: { fontSize: 18, marginRight: 8 },
  goalReward: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  goalLabel: { ...typography.caption, color: colors.textMuted, marginTop: 8, fontWeight: '600' },

  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: 4, fontSize: 16 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
