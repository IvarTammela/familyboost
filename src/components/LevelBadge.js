import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius } from '../theme/colors';
import { computeLevel } from '../data/store';

export default function LevelBadge({ points, size = 'sm', showTitle = false }) {
  const lv = computeLevel(points);
  const small = size === 'sm';
  return (
    <View style={[styles.wrap, small ? styles.small : styles.large]}>
      <View style={styles.labelRow}>
        <Text style={[styles.lvlTag, small && styles.lvlTagSm]}>LV</Text>
        <Text style={[styles.lvl, small && styles.lvlSm]}>{lv.level}</Text>
      </View>
      {showTitle && <Text style={styles.title}>{lv.title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  small: { paddingHorizontal: 8, paddingVertical: 2 },
  large: { paddingHorizontal: 12, paddingVertical: 5 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline' },
  lvlTag: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5, opacity: 0.9, marginRight: 3 },
  lvlTagSm: { fontSize: 8 },
  lvl: { color: '#fff', fontSize: 14, fontWeight: '800' },
  lvlSm: { fontSize: 12 },
  title: { color: '#fff', fontSize: 10, fontWeight: '600', marginTop: 1 },
});
