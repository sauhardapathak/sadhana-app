import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontSize, Radius, Spacing, useTheme } from '../constants/theme';

type Props = {
  streak: number;
};

export function StreakBadge({ streak }: Props) {
  const t = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: t.surfaceAlt }]}>
      <Ionicons name="flame" size={20} color={t.goldDeep} />
      <Text style={[styles.count, { color: t.textPrimary }]}>{streak}</Text>
      <Text style={[styles.label, { color: t.textSecondary }]}>
        {streak === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 4,
    alignSelf: 'flex-start',
  },
  count: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  label: {
    fontSize: FontSize.sm,
  },
});
