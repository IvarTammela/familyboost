import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { categoryMeta, typography, radius } from '../theme/colors';

export default function CategoryTag({ categoryKey, showEmoji = true }) {
  const cat = categoryMeta[categoryKey];
  if (!cat) return null;
  return (
    <View style={[styles.wrap, { backgroundColor: cat.soft }]}>
      {showEmoji && <Text style={styles.emoji}>{cat.emoji}</Text>}
      <Text style={[styles.label, { color: cat.color }]}>{cat.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  emoji: { fontSize: 12, marginRight: 5 },
  label: { ...typography.captionStrong, fontSize: 11 },
});
