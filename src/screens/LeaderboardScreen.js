import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing, shadow } from '../theme/colors';
import { useStore } from '../data/store';
import Segmented from '../components/Segmented';

function initials(name) {
  return name.slice(0, 2).toUpperCase();
}

function MemberAvatar({ member, size = 36 }) {
  const palette = ['#E0E7FF', '#FCE7F3', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FFEDD5'];
  const cols = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#7C3AED', '#F97316'];
  const idx = (member?.id?.charCodeAt(member.id.length - 1) ?? 0) % palette.length;
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: palette[idx],
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: cols[idx], fontWeight: '800', fontSize: size * 0.4 }}>
        {initials(member?.name ?? '?')}
      </Text>
    </View>
  );
}

const medals = ['🥇', '🥈', '🥉'];

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
          <Text style={styles.pageLabel}>🏆 EDETABEL</Text>
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
            const medal = medals[idx];
            return (
              <View key={entry.userId} style={[styles.row, isMe && styles.rowMe]}>
                <Text style={styles.rank}>{medal || `#${idx + 1}`}</Text>
                <MemberAvatar member={member} size={42} />
                <View style={styles.rowCenter}>
                  <Text style={[styles.name, isMe && styles.nameMe]}>
                    {member?.name}{isMe ? ' · sina' : ''}
                  </Text>
                  <View style={styles.miniBar}>
                    <View style={[styles.miniBarFill, { width: `${barPct}%` }]} />
                  </View>
                </View>
                <Text style={[styles.count, isMe && styles.countMe]}>{entry.completed}</Text>
              </View>
            );
          })}

          {sorted.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyText}>Veel pole andmeid</Text>
            </View>
          )}
        </View>

        {sorted.length > 0 && (
          <View style={[styles.footer, myRank === 1 && styles.footerWin]}>
            <Text style={styles.footerLabel}>SINU POSITSIOON</Text>
            <Text style={styles.footerBig}>
              {myRank === 1 ? '🎉 ' : ''}#{myRank} · {range === 'weekly' ? 'sellel nädalal' : 'kokku'}
            </Text>
            {myRank > 1 && gap > 0 && (
              <Text style={styles.footerSub}>
                {gap} ülesannet {state.family.members.find((m) => m.id === leader.userId)?.name}-st taga 💪
              </Text>
            )}
            {myRank === 1 && <Text style={styles.footerSub}>Sa juhid edetabelit! Hoia hoogu 🔥</Text>}
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
  pageLabel: { ...typography.captionStrong, color: colors.primary },
  title: { ...typography.title, color: colors.text, marginTop: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: spacing.md,
    borderRadius: radius.lg, marginBottom: spacing.sm,
    ...shadow.soft,
  },
  rowMe: {
    backgroundColor: colors.primarySoft,
    borderWidth: 2, borderColor: colors.primary,
  },
  rank: {
    fontSize: 22, fontWeight: '800', width: 44, color: colors.text,
  },
  rowCenter: { flex: 1, marginHorizontal: spacing.md },
  name: { ...typography.bodyStrong, color: colors.text, fontSize: 15 },
  nameMe: { color: colors.primary, fontWeight: '800' },
  miniBar: {
    height: 5, backgroundColor: colors.divider, borderRadius: 3,
    marginTop: 6, overflow: 'hidden',
  },
  miniBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  count: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  countMe: { color: colors.primary },
  footer: {
    marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg,
    backgroundColor: colors.accent, ...shadow.lifted,
  },
  footerWin: { backgroundColor: colors.success },
  footerLabel: { ...typography.captionStrong, color: '#fff', opacity: 0.9, marginBottom: 6 },
  footerBig: { ...typography.h1, color: '#fff', fontWeight: '800' },
  footerSub: { ...typography.body, color: '#fff', opacity: 0.95, marginTop: 6 },
  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...typography.body, color: colors.textMuted },
});
