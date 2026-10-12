import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QuestionDifficulty } from '../types';
import { useTheme, FontSize, Radius, Spacing } from '../constants/theme';

const LABELS: Record<QuestionDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  extreme: 'Extreme',
};

type Props = { difficulty: QuestionDifficulty };

export function DifficultyBadge({ difficulty }: Props) {
  const t = useTheme();
  const COLORS: Record<QuestionDifficulty, { bg: string; text: string }> = {
    easy: { bg: t.badgeEasyBg, text: t.badgeEasyText },
    medium: { bg: t.badgeMediumBg, text: t.badgeMediumText },
    hard: { bg: t.badgeHardBg, text: t.badgeHardText },
    extreme: { bg: t.badgeExtremeBg, text: t.badgeExtremeText },
  };
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
