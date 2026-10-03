import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

type Props = {
  streak: number;
};

export function StreakBadge({ streak }: Props) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="flame" size={20} color={Colors.gold} />
      <Text style={styles.count}>{streak}</Text>
      <Text style={styles.label}>{streak === 1 ? 'day' : 'days'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 4,
    alignSelf: 'flex-start',
  },
  count: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
