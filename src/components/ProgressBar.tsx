import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Radius } from '../constants/theme';

type Props = {
  value: number;   // 0–1
  height?: number;
  color?: string;
};

export function ProgressBar({ value, height = 8, color = Colors.primary }: Props) {
  const pct = Math.min(Math.max(value, 0), 1);
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.divider,
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
