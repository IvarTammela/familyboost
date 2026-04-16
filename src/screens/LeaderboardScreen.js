import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radius, spacing, shadow } from '../theme/colors';
import { useStore, computeLevel } from '../data/store';
import Segmented from '../components/Segmented';
import LevelBadge from '../components/LevelBadge';
import ProgressBar from '../components/ProgressBar';

function initials(name) { return name.slice(0, 2).toUpperCase(); }

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
  const [range, setRange] = useState('points');

  // Build list: by points or weekly activity
  let list;
  if (range === 'points') {
    list = state.family.members.map((m) => ({
      userId: m.id,
      points: state.points[m.id] ?? 0,
    }));
  } else {
    list = (state.leaderboard[range] ?? []).map((e) => ({
      userId: e.userId,
      points: e.completed,
    }));
  }

  const sorted = [...list].sort((a, b) => b.points - a.points);
  const myRank = sorted.findIndex((e) => e.userId === state.currentUserId) + 1;
  const leader = sorted[0];
  const me = sorted[myRank - 1];
  const gap = leader && me ? leader.points - me.points : 0;
  const maxPoints = leader?.points ?? 0;

  const myPoints = state.points[state.currentUserId] ?? 0;
  const myLevel = computeLevel(myPoints);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.pageLabel}>🏆 EDETABEL</Text>
          <Text style={styles.title}>Pere võistlus</Text>
        </View>

        {/* My level progress */}
        <View style={styles.myLevelCard}>
          <View style={styles.myLevelHeader}>
            <View>
              <Text style={styles.myLevelTitle}>{myLevel.title}</Text>
              <Text style={styles.myLevelPoints}>{myPoints} punkti</Text>
            </View>
            <LevelBadge points={myPoints} size="lg" showTitle={false} />
          </View>
          {myLevel.next && (
            <>
              <View style={{ marginTop: spacing.md }}>
                <ProgressBar value={myLevel.progressPct} color="#fff" height={8} />
              </View>
              <Text style={styles.nextLevel}>
                Järgmine tase {myLevel.next.level} ({myLevel.next.title}) {myLevel.pointsToNext} p kaugusel
              </Text>
            </>
          )}
          {!myLevel.next && (
            <Text style={styles.nextLevel}>Maksimaalne tase saavutatud 🏆</Text>
          )}
        </View>

        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: 'points',  label: 'Punktid' },
            { value: 'weekly',  label: 'Nädal' },
            { value: 'allTime', label: 'Kokku' },
          ]}
        />

        <View style={{ marginTop: spacing.lg }}>
          {sorted.map((entry, idx) => {
            const member = state.family.members.find((m) => m.id === entry.userId);
            const isMe = entry.userId === state.currentUserId;
            const barPct = maxPoints > 0 ? (entry.points / maxPoints) * 100 : 0;
            const medal = medals[idx];
            const entryPoints = range === 'points' ? (state.points[entry.userId] ?? 0) : entry.points;
            return (
              <View key={entry.userId} style={[styles.row, isMe && styles.rowMe]}>
                <Text style={styles.rank}>{medal || `#${idx + 1}`}</Text>
                <MemberAvatar member={member} size={42} />
                <View style={styles.rowCenter}>
                  <View style={styles.rowNameLine}>
                    <Text style={[styles.name, isMe && styles.nameMe]}>
                      {member?.name}{isMe ? ' · sina' : ''}
                    </Text>
                    {range === 'points' && (
                      <LevelBadge points={state.points[entry.userId] ?? 0} size="sm" />
                    )}
                  </View>
                  <View style={styles.miniBar}>
                    <View style={[styles.miniBarFill, { width: `${barPct}%` }]} />
                  </View>
                </View>
                <View style={styles.countWrap}>
                  <Text style={[styles.count, isMe && styles.countMe]}>{entry.points}</Text>
                  <Text style={styles.countUnit}>{range === 'points' ? 'p' : 'ül'}</Text>
                </View>
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
              {myRank === 1 ? '🎉 ' : ''}#{myRank} {range === 'points' ? 'punktide järgi' : range === 'weekly' ? 'sellel nädalal' : 'kokku'}
            </Text>
            {myRank > 1 && gap > 0 && (
              <Text style={styles.footerSub}>
                {gap} {range === 'points' ? 'punkti' : 'ülesannet'} {state.family.members.find((m) => m.id === leader.userId)?.name}-st taga 💪
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

  myLevelCard: {
    backgroundColor: colors.accent, borderRadius: radius.xl, padding: spacing.xl,
    marginBottom: spacing.lg, ...shadow.lifted,
  },
  myLevelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  myLevelTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  myLevelPoints: { ...typography.body, color: '#fff', opacity: 0.9, marginTop: 2 },
  nextLevel: { ...typography.caption, color: '#fff', opacity: 0.95, marginTop: 8, fontWeight: '600' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: spacing.md,
    borderRadius: radius.lg, marginBottom: spacing.sm,
    ...shadow.soft,
  },
  rowMe: { backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary },
  rank: { fontSize: 22, fontWeight: '800', width: 44, color: colors.text },
  rowCenter: { flex: 1, marginHorizontal: spacing.md },
  rowNameLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { ...typography.bodyStrong, color: colors.text, fontSize: 15, marginRight: 6 },
  nameMe: { color: colors.primary, fontWeight: '800' },
  miniBar: {
    height: 5, backgroundColor: colors.divider, borderRadius: 3,
    marginTop: 6, overflow: 'hidden',
  },
  miniBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  countWrap: { alignItems: 'flex-end' },
  count: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  countMe: { color: colors.primary },
  countUnit: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },

  footer: {
    marginTop: spacing.lg, padding: spacing.lg, borderRadius: radius.lg,
    backgroundColor: colors.primary, ...shadow.lifted,
  },
  footerWin: { backgroundColor: colors.success },
  footerLabel: { ...typography.captionStrong, color: '#fff', opacity: 0.9, marginBottom: 6 },
  footerBig: { ...typography.h1, color: '#fff', fontWeight: '800' },
  footerSub: { ...typography.body, color: '#fff', opacity: 0.95, marginTop: 6 },

  empty: { padding: spacing['2xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...typography.body, color: colors.textMuted },
});
