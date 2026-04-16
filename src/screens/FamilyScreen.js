import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme/colors';
import { useStore } from '../data/store';
import ProgressBar from '../components/ProgressBar';

function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

function MemberAvatar({ member, size = 36 }) {
  const palette = ['#E0EAFF', '#FEE2E2', '#DCFCE7', '#FEF3C7', '#F3E8FF', '#FCE7F3'];
  const colors2 = ['#2563EB', '#B91C1C', '#15803D', '#B45309', '#7C3AED', '#BE185D'];
  const idx = (member.id.charCodeAt(member.id.length - 1)) % palette.length;
  return (
    <View style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: palette[idx] },
    ]}>
      <Text style={[styles.avatarText, { color: colors2[idx], fontSize: size * 0.38 }]}>
        {initials(member.name)}
      </Text>
    </View>
  );
}

function FamilyChallengeCard({ item, members }) {
  const totalPossible = members.length * item.periodDays;
  const totalDone = Object.values(item.completions).reduce((a, b) => a + b, 0);
  const pct = Math.min(100, Math.round((totalDone / totalPossible) * 100));
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.periodText}>{item.periodDays} päeva</Text>
      </View>
      <Text style={styles.cardReward}>Preemia: {item.reward}</Text>

      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={colors.success} />
      </View>
      <Text style={styles.progressLabel}>{pct}% valmis</Text>

      <View style={styles.divider} />

      {members.map((m) => {
        const done = item.completions[m.id] ?? 0;
        const complete = done >= item.periodDays;
        return (
          <View key={m.id} style={styles.memberRow}>
            <MemberAvatar member={m} size={32} />
            <Text style={styles.memberName}>{m.name}</Text>
            <Text style={[styles.memberStatus, complete && styles.memberStatusDone]}>
              {complete ? 'Valmis' : `${done}/${item.periodDays}`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function FamilyScreen() {
  const { state } = useStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageLabel}>PEREGRUPP</Text>
          <Text style={styles.title}>{state.family.name}</Text>
          <Text style={styles.code}>Kutsekood · {state.family.inviteCode}</Text>
        </View>

        <View style={styles.membersCard}>
          <Text style={styles.sectionLabel}>LIIKMED · {state.family.members.length}</Text>
          <View style={styles.membersList}>
            {state.family.members.map((m) => (
              <View key={m.id} style={styles.memberChip}>
                <MemberAvatar member={m} size={40} />
                <Text style={styles.memberChipName}>{m.name}</Text>
                {m.role === 'admin' && <Text style={styles.adminBadge}>Admin</Text>}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Aktiivsed pereülesanded</Text>
        {state.familyChallenges.map((c) => (
          <FamilyChallengeCard key={c.id} item={c} members={state.family.members} />
        ))}

        {state.familyChallenges.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Pole pereülesandeid</Text>
            <Text style={styles.emptyText}>
              Ava Ülesanded → Pereülesanded → + Lisa
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  header: { marginBottom: spacing.lg },
  pageLabel: { ...typography.captionStrong, color: colors.textMuted },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  code: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  membersCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  sectionLabel: { ...typography.captionStrong, color: colors.textMuted, marginBottom: spacing.md },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  membersList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  memberChip: { alignItems: 'center', marginRight: spacing.md, marginBottom: spacing.sm },
  memberChipName: { ...typography.body, color: colors.text, marginTop: 4, fontWeight: '500' },
  adminBadge: {
    ...typography.captionStrong, fontSize: 9, color: colors.accent,
    marginTop: 2,
  },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', letterSpacing: -0.3 },
  card: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardTitle: { ...typography.h2, color: colors.text, flex: 1 },
  periodText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  cardReward: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  progressLabel: { ...typography.caption, color: colors.textMuted, marginTop: 6 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  memberName: { flex: 1, ...typography.body, color: colors.text, marginLeft: spacing.md },
  memberStatus: { ...typography.bodyStrong, color: colors.textMuted, fontSize: 13 },
  memberStatusDone: { color: colors.success },
  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyTitle: { ...typography.bodyStrong, color: colors.text, marginBottom: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
