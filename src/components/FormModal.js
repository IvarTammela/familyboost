import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../theme/colors';

export default function FormModal({
  visible, title, onClose, onSubmit,
  submitLabel = 'Salvesta', submitDisabled = false, children,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 460 }}>
            {children}
          </ScrollView>
          <TouchableOpacity
            style={[styles.submit, submitDisabled && styles.submitDisabled]}
            onPress={onSubmit}
            disabled={submitDisabled}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>{submitLabel}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(17, 20, 24, 0.55)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40, height: 4, backgroundColor: colors.border,
    alignSelf: 'center', borderRadius: 2, marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, color: colors.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.cardAlt,
  },
  submit: {
    marginTop: spacing.md, backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.sm, alignItems: 'center',
  },
  submitDisabled: { backgroundColor: colors.borderStrong },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16, letterSpacing: 0.2 },
});
