import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing, shadow, categoryMeta } from '../theme/colors';
import { useStore, computeLevel, POINTS } from '../data/store';
import ProgressBar from '../components/ProgressBar';
import LevelBadge from '../components/LevelBadge';
import FormModal from '../components/FormModal';
import { TextField, CategoryPicker, OptionPicker } from '../components/Field';

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
            <MemberAvatar member={m} size={32} />
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

function AssignmentForm({ onSubmitted, onCancel, members, currentUserId, existingAssignments }) {
  const { dispatch } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('movement');
  const availableMembers = members.filter((m) => m.id !== currentUserId);
  const [assigneeId, setAssigneeId] = useState(availableMembers[0]?.id);

  const alreadyAssignedToday = existingAssignments.some(
    (a) => a.assignerId === currentUserId && a.assigneeId === assigneeId && a.date === today
  );
  const canSubmit = title.trim().length > 0 && assigneeId && !alreadyAssignedToday;

  const submit = () => {
    if (!canSubmit) return;
    dispatch({
      type: 'ASSIGN_TO_MEMBER',
      assigneeId,
      title: title.trim(),
      category,
    });
    onSubmitted();
  };

  const assigneeOptions = availableMembers.map((m) => ({ value: m.id, label: m.name }));

  return (
    <FormModal
      visible
      title="Saada pereliikmele väljakutse"
      submitLabel={alreadyAssignedToday ? 'Täna juba saadetud' : 'Saada'}
      onClose={onCancel}
      onSubmit={submit}
      submitDisabled={!canSubmit}
    >
      <OptionPicker label="Kellele" value={assigneeId} onChange={setAssigneeId} options={assigneeOptions} />
      <TextField label="Väljakutse" value={title} onChangeText={setTitle} placeholder="nt Jookse 5 minutit" />
      <CategoryPicker label="Kategooria" value={category} onChange={setCategory} />
      <Text style={styles.hint}>
        Sa saad {POINTS.assignedBonus} p esitamise eest. Liige saab {POINTS.assignedComplete} p täitmise eest.
        Üks väljakutse päevas ühele liikmele.
      </Text>
    </FormModal>
  );
}

export default function FamilyScreen() {
  const { state } = useStore();
  const [membersOpen, setMembersOpen] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const myAssignmentsToday = state.memberAssignments.filter(
    (a) => a.assignerId === state.currentUserId && a.date === today
  );
  const incoming = state.memberAssignments.filter(
    (a) => a.assigneeId === state.currentUserId && a.date === today
  );

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

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowAssignForm(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Saada pereliikmele väljakutse</Text>
        </TouchableOpacity>

        {myAssignmentsToday.length > 0 && (
          <View style={styles.assignmentsCard}>
            <Text style={styles.sectionLabel}>📨 TÄNA SAADETUD</Text>
            {myAssignmentsToday.map((a) => {
              const assignee = state.family.members.find((m) => m.id === a.assigneeId);
              return (
                <View key={a.id} style={styles.assignmentRow}>
                  <Text style={styles.assignmentTarget}>→ {assignee?.name}</Text>
                  <Text style={styles.assignmentTitle} numberOfLines={1}>{a.title}</Text>
                  <Text style={[styles.assignmentStatus, a.done && styles.assignmentStatusDone]}>
                    {a.done ? '✓ tehtud' : 'ootel'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {incoming.length > 0 && (
          <View style={styles.assignmentsCard}>
            <Text style={styles.sectionLabel}>📬 SULLE SAADETUD</Text>
            {incoming.map((a) => {
              const assigner = state.family.members.find((m) => m.id === a.assignerId);
              return (
                <View key={a.id} style={styles.assignmentRow}>
                  <Text style={styles.assignmentTarget}>← {assigner?.name}</Text>
                  <Text style={styles.assignmentTitle} numberOfLines={1}>{a.title}</Text>
                  <Text style={[styles.assignmentStatus, a.done && styles.assignmentStatusDone]}>
                    {a.done ? '✓ tehtud' : 'Täna ·'}
                  </Text>
                </View>
              );
            })}
            <Text style={styles.hint}>Märgi need tehtuks Täna lehel.</Text>
          </View>
        )}

        {/* Collapsible Members */}
        <TouchableOpacity
          style={styles.collapseHeader}
          onPress={() => setMembersOpen((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={styles.collapseTitle}>👪 Liikmed · {state.family.members.length}</Text>
          <Ionicons
            name={membersOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {membersOpen && (
          <View style={styles.membersCard}>
            {state.family.members.map((m) => {
              const pts = state.points[m.id] ?? 0;
              const isMe = m.id === state.currentUserId;
              return (
                <View key={m.id} style={styles.memberCard}>
                  <MemberAvatar member={m} size={44} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <View style={styles.memberCardRow}>
                      <Text style={styles.memberCardName}>
                        {m.name}{isMe ? ' · sina' : ''}
                      </Text>
                      {m.role === 'admin' && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberCardPts}>{pts} punkti · {computeLevel(pts).title}</Text>
                  </View>
                  <LevelBadge points={pts} size="sm" />
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionTitle}>🎯 Aktiivsed pereülesanded</Text>
        {state.familyChallenges.map((c) => (
          <FamilyChallengeCard key={c.id} item={c} members={state.family.members} />
        ))}

        {state.familyChallenges.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>Pole pereülesandeid</Text>
            <Text style={styles.emptyText}>Ava Ülesanded → Pereülesanded → + Lisa</Text>
          </View>
        )}
      </ScrollView>

      {showAssignForm && (
        <AssignmentForm
          members={state.family.members}
          currentUserId={state.currentUserId}
          existingAssignments={state.memberAssignments}
          onSubmitted={() => setShowAssignForm(false)}
          onCancel={() => setShowAssignForm(false)}
        />
      )}
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

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, paddingVertical: 13,
    borderRadius: radius.md, marginBottom: spacing.lg,
    ...shadow.soft,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 14 },

  assignmentsCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg,
    marginBottom: spacing.md, ...shadow.soft,
  },
  sectionLabel: { ...typography.captionStrong, color: colors.textMuted, marginBottom: spacing.sm },
  assignmentRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  assignmentTarget: { ...typography.captionStrong, color: colors.accent, width: 70 },
  assignmentTitle: { ...typography.body, color: colors.text, flex: 1, fontWeight: '600' },
  assignmentStatus: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  assignmentStatusDone: { color: colors.success },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: 8, fontStyle: 'italic' },

  collapseHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, paddingVertical: 14, paddingHorizontal: spacing.lg,
    borderRadius: radius.lg, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  collapseTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 16 },

  membersCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.lg, ...shadow.soft,
  },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  memberCardRow: { flexDirection: 'row', alignItems: 'center' },
  memberCardName: { ...typography.bodyStrong, color: colors.text, marginRight: 6 },
  memberCardPts: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  adminBadge: {
    backgroundColor: colors.accentSoft, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  adminBadgeText: { ...typography.captionStrong, fontSize: 9, color: colors.accent },

  sectionTitle: { ...typography.h1, color: colors.text, marginBottom: spacing.md, marginTop: spacing.md },
  card: {
    backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.lg,
    marginBottom: spacing.md, ...shadow.soft,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
