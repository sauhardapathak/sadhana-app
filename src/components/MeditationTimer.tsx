import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, FontSize, Radius, Spacing } from '../constants/theme';

type Props = {
  onComplete: (minutes: number) => void;
};

const PRESETS = [5, 10, 15, 20, 30];

// V1 is screen-on only — no background timing: the countdown runs via
// setInterval while this screen is mounted and the app is in the foreground.
// It does not keep time when the app is backgrounded, suspended, or killed.

function formatMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function MeditationTimer({ onComplete }: Props) {
  const t = useTheme();
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [remainingSec, setRemainingSec] = useState(10 * 60);
  const [running, setRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Countdown tick. Cleared on pause, reset, preset change, and unmount.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemainingSec((sec) => {
        if (sec <= 1) {
          clearInterval(id);
          setRunning(false);
          Alert.alert('Meditation complete', 'Take a moment of gratitude. 🙏');
          onCompleteRef.current(selectedMinutes);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, selectedMinutes]);

  function handleSelectPreset(min: number) {
    setSelectedMinutes(min);
    setRemainingSec(min * 60);
    setRunning(false);
  }

  function handleReset() {
    setRunning(false);
    setRemainingSec(selectedMinutes * 60);
  }

  return (
    <View style={[styles.card, { backgroundColor: t.surface }]}>
      <View style={styles.header}>
        <Ionicons name="water-outline" size={20} color={t.primaryStrong} />
        <Text style={[styles.heading, { color: t.textPrimary }]}>Meditation Timer</Text>
      </View>

      {/* Preset chips */}
      <View style={styles.chipsRow}>
        {PRESETS.map((min) => {
          const active = min === selectedMinutes;
          return (
            <Pressable
              key={min}
              style={[
                styles.chip,
                { backgroundColor: active ? t.primaryStrong : t.surfaceAlt },
              ]}
              onPress={() => handleSelectPreset(min)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${min} minutes`}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? t.textInverse : t.textSecondary },
                ]}
              >
                {min}m
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.clock, { color: t.primary }]}>{formatMMSS(remainingSec)}</Text>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.controlBtn, { backgroundColor: t.primaryStrong }]}
          onPress={() => setRunning((r) => !r)}
          accessibilityRole="button"
          accessibilityLabel={running ? 'Pause timer' : 'Start timer'}
        >
          <Ionicons
            name={running ? 'pause' : 'play'}
            size={20}
            color={t.textInverse}
          />
          <Text style={[styles.controlLabel, { color: t.textInverse }]}>
            {running ? 'Pause' : 'Start'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.controlBtn, styles.resetBtn, { backgroundColor: t.surfaceAlt }]}
          onPress={handleReset}
          accessibilityRole="button"
          accessibilityLabel="Reset timer"
        >
          <Ionicons name="refresh" size={20} color={t.textSecondary} />
          <Text style={[styles.controlLabel, { color: t.textSecondary }]}>Reset</Text>
        </Pressable>
      </View>
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
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  chipLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  clock: {
    fontSize: FontSize.hero,
    fontWeight: '800',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
  },
  resetBtn: {},
  controlLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
