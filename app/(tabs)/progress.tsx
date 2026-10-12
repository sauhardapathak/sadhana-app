/**
 * Progress Screen — Goals + Seva log
 */
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { ProgressBar } from '../../src/components/ProgressBar';
import { useTheme, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { Goal } from '../../src/types';
import { getTodayISO } from '../../src/utils/date';

const CATEGORY_ICONS: Record<Goal['category'], keyof typeof Ionicons.glyphMap> = {
  puja: 'flower-outline',
  japa: 'musical-notes-outline',
  meditation: 'water-outline',
  reading: 'book-outline',
  service: 'heart-outline',
  other: 'ellipse-outline',
};

const GOAL_CATEGORIES: Goal['category'][] = [
  'puja',
  'japa',
  'meditation',
  'reading',
  'service',
  'other',
];

export default function ProgressScreen() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const { goals } = state;

  const today = getTodayISO();
  const sevaLog = state.sevaLog ?? [];
  const sevaDoneToday = sevaLog.some((e) => e.date === today);

  const activeGoals = goals.filter((g) => g.currentCount < g.targetCount);
  const completedGoals = goals.filter((g) => g.currentCount >= g.targetCount);

  // ── Add-goal form ──
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formTarget, setFormTarget] = useState('10');
  const [formUnit, setFormUnit] = useState('days');
  const [formCategory, setFormCategory] = useState<Goal['category']>('other');

  const categoryColors: Record<Goal['category'], string> = {
    puja: '#FDE8D0',
    japa: '#EDE8F5',
    meditation: '#D0EAF8',
    reading: '#D4EDDA',
    service: '#FCE4EC',
    other: t.surfaceAlt,
  };

  function handleIncrement(id: string) {
    dispatch({ type: 'UPDATE_GOAL', id, increment: 1 });
  }

  function handleLogSeva() {
    if (sevaDoneToday) return;
    dispatch({ type: 'LOG_SEVA', date: today });
  }

  function handleSaveGoal() {
    const title = formTitle.trim();
    if (!title) {
      Alert.alert('Title is required.');
      return;
    }
    const parsed = parseInt(formTarget, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      Alert.alert('Enter a valid target count.');
      return;
    }
    const unit = formUnit.trim() || 'days';
    dispatch({
      type: 'ADD_GOAL',
      title,
      targetCount: parsed,
      unit,
      category: formCategory,
      assignedBy: 'self',
    });
    setFormTitle('');
    setFormTarget('10');
    setFormUnit('days');
    setFormCategory('other');
    setShowForm(false);
  }

  function handleDeleteGoal(id: string) {
    Alert.alert('Delete goal?', 'This will remove it from your list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'REMOVE_GOAL', id }),
      },
    ]);
  }

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
    heading: { fontSize: FontSize.hero, fontWeight: '800', color: t.textPrimary },
    sub: { fontSize: FontSize.md, color: t.textSecondary },
    section: { gap: Spacing.sm },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: t.textPrimary },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: t.primaryStrong,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
    },
    addBtnLabel: { fontSize: FontSize.sm, fontWeight: '700', color: t.textInverse },

    sevaCard: { gap: Spacing.xs },
    sevaTitle: { fontSize: FontSize.md, fontWeight: '700', color: t.textPrimary },
    sevaCaption: { fontSize: FontSize.sm, color: t.textMuted },
    sevaBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.xs,
      backgroundColor: t.primaryStrong,
      borderRadius: Radius.md,
      paddingVertical: Spacing.sm,
      marginTop: Spacing.xs,
    },
    sevaBtnDisabled: { opacity: 0.5 },
    sevaBtnText: { fontSize: FontSize.md, fontWeight: '700', color: t.textInverse },

    formCard: { gap: Spacing.sm },
    formTitle: { fontSize: FontSize.lg, fontWeight: '700', color: t.textPrimary },
    formLabel: { fontSize: FontSize.sm, color: t.textMuted, fontWeight: '600' },
    formInput: {
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      fontSize: FontSize.md,
      color: t.textPrimary,
      backgroundColor: t.surface,
    },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
    chip: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
      borderRadius: Radius.full,
      backgroundColor: t.surfaceAlt,
    },
    chipLabel: { fontSize: FontSize.xs, color: t.textSecondary, fontWeight: '700' },
    chipLabelActive: { color: t.textInverse },
    formBtnRow: { flexDirection: 'row', gap: Spacing.sm },
    saveBtn: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: t.primaryStrong,
      borderRadius: Radius.md,
      paddingVertical: Spacing.sm,
    },
    saveBtnText: { fontSize: FontSize.md, fontWeight: '700', color: t.textInverse },
    cancelBtn: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: t.surfaceAlt,
      borderRadius: Radius.md,
      paddingVertical: Spacing.sm,
    },
    cancelBtnText: { fontSize: FontSize.md, fontWeight: '700', color: t.textSecondary },

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
    goalTitle: { fontSize: FontSize.md, fontWeight: '700', color: t.textPrimary },
    goalDesc: { fontSize: FontSize.sm, color: t.textSecondary },
    goalAssigned: { fontSize: FontSize.xs, color: t.textMuted },
    goalDeadline: { fontSize: FontSize.xs, color: t.textMuted },
    goalSideBtns: { alignItems: 'center', gap: 6 },
    incrementBtn: {
      width: 32,
      height: 32,
      borderRadius: Radius.full,
      backgroundColor: t.primaryStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteBtn: { padding: 6 },
    goalCountRow: { flexDirection: 'row', justifyContent: 'space-between' },
    goalCount: { fontSize: FontSize.sm, color: t.textSecondary },
    goalPct: { fontSize: FontSize.sm, fontWeight: '700', color: t.primaryStrong },
    empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
    emptyText: { fontSize: FontSize.md, color: t.textMuted },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Progress</Text>
        <Text style={styles.sub}>Goals set by your spiritual guide.</Text>

        {/* Seva log */}
        <Card style={styles.sevaCard}>
          <Text style={styles.sevaTitle}>Seva</Text>
          <Text style={styles.sevaCaption}>{sevaLog.length} sessions logged</Text>
          <Pressable
            style={[styles.sevaBtn, sevaDoneToday && styles.sevaBtnDisabled]}
            onPress={handleLogSeva}
            disabled={sevaDoneToday}
            accessibilityRole="button"
            accessibilityLabel="Log today's seva"
          >
            <Ionicons name="heart-outline" size={18} color={t.textInverse} />
            <Text style={styles.sevaBtnText}>
              {sevaDoneToday ? "Today's seva logged 🙏" : "Log today's seva"}
            </Text>
          </Pressable>
        </Card>

        {/* Add-goal header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <Pressable
            style={styles.addBtn}
            onPress={() => setShowForm((s) => !s)}
            accessibilityRole="button"
            accessibilityLabel="Add goal"
          >
            <Ionicons name="add" size={16} color={t.textInverse} />
            <Text style={styles.addBtnLabel}>Add</Text>
          </Pressable>
        </View>

        {/* Add-goal form */}
        {showForm && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Add goal</Text>
            <Text style={styles.formLabel}>Title (required)</Text>
            <TextInput
              style={styles.formInput}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="e.g. Complete 30 days of Japa"
              placeholderTextColor={t.textMuted}
            />
            <Text style={styles.formLabel}>Target count</Text>
            <TextInput
              style={styles.formInput}
              value={formTarget}
              onChangeText={setFormTarget}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={t.textMuted}
            />
            <Text style={styles.formLabel}>Unit</Text>
            <TextInput
              style={styles.formInput}
              value={formUnit}
              onChangeText={setFormUnit}
              placeholder="days"
              placeholderTextColor={t.textMuted}
            />
            <Text style={styles.formLabel}>Category</Text>
            <View style={styles.chipsRow}>
              {GOAL_CATEGORIES.map((c) => {
                const active = c === formCategory;
                return (
                  <Pressable
                    key={c}
                    style={[styles.chip, active && { backgroundColor: t.primaryStrong }]}
                    onPress={() => setFormCategory(c)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.formBtnRow}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setShowForm(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveBtn}
                onPress={handleSaveGoal}
                accessibilityRole="button"
                accessibilityLabel="Save goal"
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </Card>
        )}

        {/* Active goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                iconBg={categoryColors[goal.category]}
                onIncrement={() => handleIncrement(goal.id)}
                onDelete={() => handleDeleteGoal(goal.id)}
              />
            ))}
          </View>
        )}

        {/* Completed goals */}
        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed 🎉</Text>
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                iconBg={categoryColors[goal.category]}
                onIncrement={() => {}}
                onDelete={() => handleDeleteGoal(goal.id)}
                completed
              />
            ))}
          </View>
        )}

        {goals.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={40} color={t.textMuted} />
            <Text style={styles.emptyText}>No goals assigned yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalCard({
  goal,
  iconBg,
  onIncrement,
  onDelete,
  completed = false,
}: {
  goal: Goal;
  iconBg: string;
  onIncrement: () => void;
  onDelete: () => void;
  completed?: boolean;
}) {
  const t = useTheme();
  const pct = goal.targetCount > 0 ? goal.currentCount / goal.targetCount : 0;
  const icon = CATEGORY_ICONS[goal.category];

  const styles = StyleSheet.create({
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
    goalTitle: { fontSize: FontSize.md, fontWeight: '700', color: t.textPrimary },
    goalDesc: { fontSize: FontSize.sm, color: t.textSecondary },
    goalAssigned: { fontSize: FontSize.xs, color: t.textMuted },
    goalDeadline: { fontSize: FontSize.xs, color: t.textMuted },
    goalSideBtns: { alignItems: 'center', gap: 6 },
    incrementBtn: {
      width: 32,
      height: 32,
      borderRadius: Radius.full,
      backgroundColor: t.primaryStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteBtn: { padding: 6 },
    goalCountRow: { flexDirection: 'row', justifyContent: 'space-between' },
    goalCount: { fontSize: FontSize.sm, color: t.textSecondary },
    goalPct: { fontSize: FontSize.sm, fontWeight: '700', color: t.primaryStrong },
  });

  return (
    <Card style={styles.goalCard}>
      <View style={styles.goalTop}>
        <View style={[styles.goalIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={t.primaryStrong} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          {goal.description && <Text style={styles.goalDesc}>{goal.description}</Text>}
          <Text style={styles.goalAssigned}>by {goal.assignedBy}</Text>
          {goal.deadline && <Text style={styles.goalDeadline}>Due {goal.deadline}</Text>}
        </View>
        <View style={styles.goalSideBtns}>
          {!completed && (
            <Pressable
              style={styles.incrementBtn}
              onPress={onIncrement}
              hitSlop={8}
              accessibilityLabel="Increment goal"
            >
              <Ionicons name="add" size={20} color={t.textInverse} />
            </Pressable>
          )}
          {completed && (
            <Ionicons name="checkmark-circle" size={28} color={t.success} />
          )}
          <Pressable
            style={styles.deleteBtn}
            onPress={onDelete}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${goal.title}`}
          >
            <Ionicons name="trash-outline" size={16} color={t.textMuted} />
          </Pressable>
        </View>
      </View>

      <ProgressBar
        value={pct}
        height={8}
        color={completed ? t.success : t.primary}
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
