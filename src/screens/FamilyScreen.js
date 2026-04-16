import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing, shadow } from '../theme/colors';
import { useStore } from '../data/store';
import ProgressBar from '../components/ProgressBar';

function initials(name) { return name.slice(0, 2).toUpperCase(); }

function MemberAvatar({ member, size = 40 }) {
  const palette = ['#E0E7FF', '#FCE7F3', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FFEDD5'];
  const cols = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#7C3AED', '#F97316'];
  const idx = (member.id.charCodeAt(member.id.length - 1)) % palette.length;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: palette[idx],
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: cols[idx], fontWeight: '800', fontSize: size * 0.4 }}>
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
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>{item.periodDays} p</Text>
        </View>
      </View>
      <View style={styles.rewardBox}>
        <Text style={styles.rewardEmoji}>🎁</Text>
        <Text style={styles.rewardText}>{item.reward}</Text>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <ProgressBar value={pct} color={colors.success} height={10} />
      </View>
      <Text style={styles.progressLabel}>Pere progress: {pct}%</Text>

      <View style={styles.divider} />

      {members.map((m) => {
        const done = item.completions[m.id] ?? 0;
        const complete = done >= item.periodDays;
        return (
          <View key={m.id} style={styles.memberRow}>
            <MemberAvatar member={m} size={36} />
            <Text style={styles.memberName}>{m.name}</Text>
            <View style={[styles.memberStatusBadge, complete && styles.memberStatusBadgeDone]}>
              <Text style={[styles.memberStatus, complete && styles.memberStatusDone]}>
                {complete ? '✓ valmis' : `${done}/${item.periodDays}`}
              </Text>
            </View>
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
          <Text style={styles.pageLabel}>🏡 PEREGRUPP</Text>
          <Text style={styles.title}>{state.family.name}</Text>
          <View style={styles.codeWrap}>
            <Text style={styles.codeLabel}>Kutsekood</Text>
            <Text style={styles.codeText}>{state.family.inviteCode}</Text>
          </View>
        </View>

        <View style={styles.membersCard}>
          <Text style={styles.sectionLabel}>👪 LIIKMED · {state.family.members.length}</Text>
          <View style={styles.membersList}>
            {state.family.members.map((m) => (
              <View key={m.id} style={styles.memberChip}>
                <MemberAvatar member={m} size={52} />
                <Text style={styles.memberChipName}>{m.name}</Text>
                {m.role === 'admin' && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>🎯 Aktiivsed pereülesanded</Text>
        {state.familyChallenges.map((c) => (
          <FamilyChallengeCard key={c.id} item={c} members={state.family.members} />
        ))}

        {state.familyChallenges.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
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
  pageLabel: { ...typography.captionStrong, color: colors.primary },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  codeWrap: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: colors.accentSoft, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.pill, alignSelf: 'flex-start',
  },
  codeLabel: { ...typography.captionStrong, color: colors.accent, marginRight: 6 },
  codeText: { ...typography.bodyStrong, color: colors.accent, fontSize: 13, letterSpacing: 1 },

  membersCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.lg, ...shadow.soft,
  },
  sectionLabel: { ...typography.captionStrong, color: colors.textMuted, marginBottom: spacing.md },
  sectionTitle: { ...typography.h1, color: colors.text, marginBottom: spacing.md },
  membersList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  memberChip: { alignItems: 'center', marginRight: spacing.md, marginBottom: spacing.sm, minWidth: 60 },
  memberChipName: { ...typography.bodyStrong, color: colors.text, marginTop: 6, fontSize: 13 },
  adminBadge: {
    backgroundColor: colors.accentSoft, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4, marginTop: 2,
  },
  adminBadgeText: { ...typography.captionStrong, fontSize: 9, color: colors.accent },

  card: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg,
    marginBottom: spacing.md, ...shadow.soft,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardTitle: { ...typography.h2, color: colors.text, flex: 1 },
  periodBadge: {
    backgroundColor: colors.accentSoft, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill,
  },
  periodText: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  rewardBox: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10,
    backgroundColor: colors.warningSoft, padding: 10, borderRadius: radius.sm,
  },
  rewardEmoji: { fontSize: 18, marginRight: 8 },
  rewardText: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  progressLabel: { ...typography.caption, color: colors.textMuted, marginTop: 6, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  memberName: { flex: 1, ...typography.body, color: colors.text, marginLeft: spacing.md, fontWeight: '600' },
  memberStatusBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill,
    backgroundColor: colors.bgAlt,
  },
  memberStatusBadgeDone: { backgroundColor: colors.successSoft },
  memberStatus: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  memberStatusDone: { color: colors.success },

  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.h2, color: colors.text, marginBottom: 4 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
