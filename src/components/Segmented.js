import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, radius } from '../theme/colors';

export default function Segmented({ options, value, onChange, size = 'md' }) {
  return (
    <View style={[styles.wrap, size === 'sm' && styles.wrapSm]}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.btn, active && styles.btnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.text, active && styles.textActive, size === 'sm' && styles.textSm]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.bgAlt,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wrapSm: { padding: 3 },
  btn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  btnActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  text: { ...typography.bodyStrong, color: colors.textMuted, fontSize: 13 },
  textSm: { fontSize: 12 },
  textActive: { color: '#fff', fontWeight: '700' },
});
