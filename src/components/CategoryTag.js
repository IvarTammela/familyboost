import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { categoryMeta, typography } from '../theme/colors';

export default function CategoryTag({ categoryKey, size = 'sm' }) {
  const cat = categoryMeta[categoryKey];
  if (!cat) return null;
  return (
    <View style={[styles.wrap, size === 'md' && styles.md]}>
      <View style={[styles.dot, { backgroundColor: cat.color }]} />
      <Text style={[styles.label, { color: cat.color }]}>{cat.label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  md: { marginBottom: 4 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    ...typography.captionStrong,
  },
});
