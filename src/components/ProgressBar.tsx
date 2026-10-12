import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme, Radius } from '../constants/theme';

type Props = {
  value: number;   // 0–1
  height?: number;
  color?: string;
};

export function ProgressBar({ value, height = 8, color }: Props) {
  const t = useTheme();
  const pct = Math.min(Math.max(value, 0), 1);
  return (
    <View style={[styles.track, { height, backgroundColor: t.divider }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color ?? t.primary, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
