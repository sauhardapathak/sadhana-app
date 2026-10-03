/**
 * Progress Screen — Goals assigned by the spiritual guide
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { Goal } from '../../src/types';

const CATEGORY_COLORS: Record<Goal['category'], string> = {
  puja: '#FDE8D0',
  japa: '#EDE8F5',
  meditation: '#D0EAF8',
  reading: '#D4EDDA',
  service: '#FCE4EC',
  other: Colors.surfaceAlt,
};

const CATEGORY_ICONS: Record<Goal['category'], keyof typeof Ionicons.glyphMap> = {
  puja: 'flower-outline',
  japa: 'musical-notes-outline',
  meditation: 'water-outline',
  reading: 'book-outline',
  service: 'heart-outline',
  other: 'ellipse-outline',
};

export default function ProgressScreen() {
  const { state, dispatch } = useStore();
  const { goals } = state;

  const activeGoals = goals.filter((g) => g.currentCount < g.targetCount);
  const completedGoals = goals.filter((g) => g.currentCount >= g.targetCount);

  function handleIncrement(id: string) {
    dispatch({ type: 'UPDATE_GOAL', id, increment: 1 });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Progress</Text>
        <Text style={styles.sub}>Goals set by your spiritual guide.</Text>

        {/* Active goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onIncrement={() => handleIncrement(goal.id)} />
            ))}
          </View>
        )}

        {/* Completed goals */}
        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed 🎉</Text>
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onIncrement={() => {}} completed />
            ))}
          </View>
        )}

        {goals.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No goals assigned yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalCard({
  goal,
  onIncrement,
  completed = false,
}: {
  goal: Goal;
  onIncrement: () => void;
  completed?: boolean;
}) {
  const pct = goal.targetCount > 0 ? goal.currentCount / goal.targetCount : 0;
  const iconBg = CATEGORY_COLORS[goal.category];
  const icon = CATEGORY_ICONS[goal.category];

  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={Colors.primary} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.description && <Text style={styles.goalDesc}>{goal.description}</Text>}
          <Text style={styles.goalAssigned}>by {goal.assignedBy}</Text>
        </View>
        {!completed && (
          <Pressable
            style={styles.incrementBtn}
            onPress={onIncrement}
            hitSlop={8}
            accessibilityLabel="Increment goal"
          >
            <Ionicons name="add" size={20} color={Colors.surface} />
          </Pressable>
        )}
        {completed && (
          <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
        )}
      </View>

      <ProgressBar
        value={pct}
        height={8}
        color={completed ? Colors.success : Colors.primary}
      />

      <View style={styles.goalCountRow}>
        <Text style={styles.goalCount}>
          {goal.currentCount} / {goal.targetCount} {goal.unit}
        </Text>
        <Text style={styles.goalPct}>{Math.round(pct * 100)}%</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  heading: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  goalCard: { gap: Spacing.sm },
  goalTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  goalInfo: { flex: 1, gap: 2 },
  goalTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  goalDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  goalAssigned: { fontSize: FontSize.xs, color: Colors.textMuted },
  incrementBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalCount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  goalPct: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
