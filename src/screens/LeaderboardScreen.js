import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing } from '../theme/colors';
import { useStore } from '../data/store';
import Segmented from '../components/Segmented';

function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

function MemberAvatar({ member, size = 36 }) {
  const palette = ['#E0EAFF', '#FEE2E2', '#DCFCE7', '#FEF3C7', '#F3E8FF', '#FCE7F3'];
  const cols = ['#2563EB', '#B91C1C', '#15803D', '#B45309', '#7C3AED', '#BE185D'];
  const idx = (member.id.charCodeAt(member.id.length - 1)) % palette.length;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: palette[idx],
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: cols[idx], fontWeight: '700', fontSize: size * 0.38 }}>
        {initials(member.name)}
      </Text>
    </View>
  );
}

export default function LeaderboardScreen() {
  const { state } = useStore();
  const [range, setRange] = useState('weekly');
  const list = state.leaderboard[range] ?? [];
  const sorted = [...list].sort((a, b) => b.completed - a.completed);
  const myRank = sorted.findIndex((e) => e.userId === state.currentUserId) + 1;
  const leader = sorted[0];
  const me = sorted[myRank - 1];
  const gap = leader && me ? leader.completed - me.completed : 0;
  const maxCompleted = leader?.completed ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageLabel}>EDETABEL</Text>
          <Text style={styles.title}>Pere võistlus</Text>
        </View>

        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: 'weekly',  label: 'Nädal' },
            { value: 'allTime', label: 'Kokku' },
          ]}
        />

        <View style={{ marginTop: spacing.lg }}>
          {sorted.map((entry, idx) => {
            const member = state.family.members.find((m) => m.id === entry.userId);
            const isMe = entry.userId === state.currentUserId;
            const barPct = maxCompleted > 0 ? (entry.completed / maxCompleted) * 100 : 0;
            return (
              <View key={entry.userId} style={[styles.row, isMe && styles.rowMe]}>
                <Text style={styles.rank}>#{idx + 1}</Text>
                <MemberAvatar member={member} size={36} />
                <View style={styles.rowCenter}>
                  <Text style={[styles.name, isMe && styles.nameMe]}>
                    {member?.name}{isMe ? ' · sina' : ''}
                  </Text>
                  <View style={styles.miniBar}>
                    <View style={[styles.miniBarFill, { width: `${barPct}%` }]} />
                  </View>
                </View>
                <Text style={styles.count}>{entry.completed}</Text>
              </View>
            );
          })}

          {sorted.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Veel pole andmeid</Text>
            </View>
          )}
        </View>

        {sorted.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerLabel}>SINU POSITSIOON</Text>
            <Text style={styles.footerBig}>
              #{myRank} · {range === 'weekly' ? 'sellel nädalal' : 'kokku'}
            </Text>
            {myRank > 1 && gap > 0 && (
              <Text style={styles.footerSub}>
                {gap} ülesannet {state.family.members.find((m) => m.id === leader.userId)?.name}-st taga
              </Text>
            )}
            {myRank === 1 && <Text style={styles.footerSub}>Sa juhid edetabelit</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  header: { marginBottom: spacing.lg },
  pageLabel: { ...typography.captionStrong, color: colors.textMuted },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: spacing.md,
    borderRadius: radius.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  rowMe: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  rank: {
    ...typography.bodyStrong, width: 36, color: colors.textMuted,
  },
  rowCenter: { flex: 1, marginHorizontal: spacing.md },
  name: { ...typography.bodyStrong, color: colors.text },
  nameMe: { color: colors.accent },
  miniBar: {
    height: 4, backgroundColor: colors.divider, borderRadius: 2,
    marginTop: 6, overflow: 'hidden',
  },
  miniBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  count: { ...typography.h2, color: colors.text },
  footer: {
    marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  footerLabel: { ...typography.captionStrong, color: colors.textMuted, marginBottom: 6 },
  footerBig: { ...typography.h1, color: colors.text },
  footerSub: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted },
});
