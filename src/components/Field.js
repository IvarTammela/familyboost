import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, categoryMeta, typography, radius, spacing } from '../theme/colors';

export function TextField({ label, value, onChangeText, placeholder, multiline, keyboardType }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export function NumberField({ label, value, onChangeText, placeholder }) {
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={(v) => onChangeText(v.replace(/[^0-9]/g, ''))}
      placeholder={placeholder}
      keyboardType="number-pad"
    />
  );
}

export function CategoryPicker({ label, value, onChange }) {
  const keys = Object.keys(categoryMeta);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {keys.map((k) => {
          const cat = categoryMeta[k];
          const active = value === k;
          return (
            <TouchableOpacity
              key={k}
              onPress={() => onChange(k)}
              style={[
                styles.chip,
                active && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
            >
              <View style={[styles.chipDot, { backgroundColor: active ? '#fff' : cat.color }]} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function OptionPicker({ label, options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.option, active && styles.optionActive]}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { ...typography.captionStrong, color: colors.textMuted, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardAlt,
    borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: colors.text,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  chipText: { ...typography.body, fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextActive: { color: '#fff' },
  option: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10,
    marginRight: 8, marginBottom: 8,
  },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { ...typography.body, fontSize: 13, color: colors.text, fontWeight: '500' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
});
