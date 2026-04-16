import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography } from '../theme/colors';

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
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    padding: 3,
  },
  wrapSm: { padding: 2 },
  btn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  btnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  text: { ...typography.bodyStrong, color: colors.textMuted, fontSize: 13 },
  textSm: { fontSize: 12 },
  textActive: { color: colors.text },
});
