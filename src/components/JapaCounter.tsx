import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FontSize, Radius, Spacing } from '../constants/theme';
import { ProgressBar } from './ProgressBar';

type Props = {
  today: string;
  rounds: number;
  onLogRound: () => void;
};

const FULL_ROUNDS = 108;

export function JapaCounter({ today, rounds, onLogRound }: Props) {
  const t = useTheme();
  const done = rounds >= FULL_ROUNDS;

  return (
    <View style={[styles.card, { backgroundColor: t.surface }]}>
      <View style={styles.header}>
        <Ionicons name="musical-notes-outline" size={20} color={t.primaryStrong} />
        <Text style={[styles.heading, { color: t.textPrimary }]}>Japa Rounds</Text>
      </View>

      <Text style={[styles.count, { color: t.primary }]}>
        {Math.min(rounds, FULL_ROUNDS)}
        <Text style={[styles.countTotal, { color: t.textMuted }]}> / {FULL_ROUNDS}</Text>
      </Text>
      <ProgressBar value={rounds / FULL_ROUNDS} height={10} />

      {done ? (
        <View style={styles.doneRow}>
          <Ionicons name="checkmark-circle" size={18} color={t.success} />
          <Text style={[styles.doneText, { color: t.success }]}>
            108 rounds complete! Hari Om 🙏
          </Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.tapTarget,
            { backgroundColor: t.primaryStrong },
            pressed && styles.pressed,
          ]}
          onPress={onLogRound}
          accessibilityRole="button"
          accessibilityLabel={`Log one japa round for ${today}. Round ${rounds + 1} of ${FULL_ROUNDS}`}
        >
          <Ionicons name="add" size={28} color={t.textInverse} />
          <Text style={[styles.tapLabel, { color: t.textInverse }]}>Tap after each round</Text>
        </Pressable>
      )}

      <Text style={[styles.hint, { color: t.textMuted }]}>
        {done ? 'Rest in the Name.' : 'Each tap counts one round (108 taps = full practice).'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heading: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  count: {
    fontSize: FontSize.hero,
    fontWeight: '800',
  },
  countTotal: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  tapTarget: {
    minHeight: 96,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  pressed: { opacity: 0.85 },
  tapLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  doneText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  hint: {
    fontSize: FontSize.sm,
  },
});
