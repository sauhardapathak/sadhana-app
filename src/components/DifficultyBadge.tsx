import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QuestionDifficulty } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../constants/theme';

const COLORS: Record<QuestionDifficulty, { bg: string; text: string }> = {
  easy: { bg: '#D4EDDA', text: Colors.success },
  medium: { bg: '#FFF3CD', text: Colors.warning },
  hard: { bg: '#F8D7DA', text: Colors.error },
  extreme: { bg: '#3D0C02', text: '#FFD700' },
};

const LABELS: Record<QuestionDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  extreme: 'Extreme',
};

type Props = { difficulty: QuestionDifficulty };

export function DifficultyBadge({ difficulty }: Props) {
  const { bg, text } = COLORS[difficulty];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{LABELS[difficulty]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
