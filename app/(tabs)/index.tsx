/**
 * Home Screen — Today's Sādhana + Streak
 */
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { SadhanaCheckItem } from '../../src/components/SadhanaCheckItem';
import { StreakBadge } from '../../src/components/StreakBadge';
import { ProgressBar } from '../../src/components/ProgressBar';
import { JapaCounter } from '../../src/components/JapaCounter';
import { MeditationTimer } from '../../src/components/MeditationTimer';
import { useTheme, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { getGreeting, getTodayISO } from '../../src/utils/date';
import { getQuoteForDate } from '../../src/utils/quotes';
import { SadhanaItem } from '../../src/types';

const CATEGORIES: SadhanaItem['category'][] = [
  'puja',
  'japa',
  'meditation',
  'reading',
  'service',
  'other',
];

export default function HomeScreen() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const { sadhanaItems, todayProgress, profile } = state;

  const today = getTodayISO();
  const quote = getQuoteForDate(today);

  const completedCount = todayProgress.completed.length;
  const totalCount = sadhanaItems.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const hasJapa = sadhanaItems.some((i) => i.category === 'japa');
  const hasMeditation = sadhanaItems.some((i) => i.category === 'meditation');
  const japaRounds = state.japa.date === today ? state.japa.rounds : 0;

  // ── Practice form (add / edit) ──
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDuration, setFormDuration] = useState('15');
  const [formCategory, setFormCategory] = useState<SadhanaItem['category']>('puja');

  function handleToggle(id: string) {
    dispatch({ type: 'TOGGLE_SADHANA', id, today: getTodayISO() });
  }

  function openAddForm() {
    setEditingId(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormDuration('15');
    setFormCategory('puja');
    setShowForm(true);
  }

  function openEditForm(item: SadhanaItem) {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormSubtitle(item.subtitle ?? '');
    setFormDuration(String(item.durationMin));
    setFormCategory(item.category);
    setShowForm(true);
  }

  function handleSaveForm() {
    const title = formTitle.trim();
    if (!title) {
      Alert.alert('Title is required.');
      return;
    }
    const parsed = parseInt(formDuration, 10);
    const durationMin = Number.isFinite(parsed) && parsed > 0 ? parsed : 15;
    if (editingId) {
      dispatch({
        type: 'UPDATE_SADHANA',
        id: editingId,
        patch: {
          title,
          subtitle: formSubtitle.trim() || undefined,
          durationMin,
          category: formCategory,
        },
      });
    } else {
      dispatch({
        type: 'ADD_SADHANA',
        title,
        subtitle: formSubtitle.trim() || undefined,
        durationMin,
        category: formCategory,
      });
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    Alert.alert('Delete practice?', 'This will remove it from your list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch({ type: 'REMOVE_SADHANA', id }),
      },
    ]);
  }

  function handleMove(id: string, dir: -1 | 1) {
    const idx = sadhanaItems.findIndex((i) => i.id === id);
    const next = idx + dir;
    if (idx < 0 || next < 0 || next >= sadhanaItems.length) return;
    const ids = sadhanaItems.map((i) => i.id);
    const tmp = ids[idx];
    ids[idx] = ids[next];
    ids[next] = tmp;
    dispatch({ type: 'REORDER_SADHANA', ids });
  }

  function handleLogRound() {
    if (japaRounds >= 108) return;
    dispatch({ type: 'LOG_JAPA_ROUND', today });
  }

  function handleMeditationComplete(minutes: number) {
    dispatch({ type: 'LOG_MEDITATION', date: today, minutes });
  }

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.xs,
    },
    greeting: { fontSize: FontSize.md, color: t.textSecondary },
    name: { fontSize: FontSize.xxl, fontWeight: '700', color: t.textPrimary },

    quoteCard: { backgroundColor: t.surfaceAlt, borderLeftWidth: 4, borderLeftColor: t.primary },
    quoteText: { fontSize: FontSize.md, color: t.textPrimary, fontStyle: 'italic', lineHeight: 22 },
    quoteSource: { fontSize: FontSize.sm, color: t.textMuted, marginTop: 6 },

    section: { gap: Spacing.xs },
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
    progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    progressLabel: { fontSize: FontSize.sm, color: t.textSecondary, width: 32, textAlign: 'right' },

    doneBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#D4EDDA',
      borderRadius: 8,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      marginTop: 4,
    },
    doneBannerText: { fontSize: FontSize.sm, color: t.success, fontWeight: '600' },

    divider: { height: 1, backgroundColor: t.divider },

    itemActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingBottom: Spacing.xs,
    },
    itemAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingVertical: 4,
      paddingHorizontal: 2,
    },
    itemActionLabel: { fontSize: FontSize.xs, color: t.textMuted, fontWeight: '600' },
    itemMoveWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    moveBtn: { padding: 6 },
    moveBtnDisabled: { opacity: 0.3 },

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

    streakCard: {},
    streakHeading: {
      fontSize: FontSize.md,
      fontWeight: '700',
      color: t.textPrimary,
      marginBottom: Spacing.sm,
    },
    streakRow: { flexDirection: 'row', justifyContent: 'space-around' },
    streakStat: { alignItems: 'center', flex: 1 },
    streakNumber: {
      fontSize: FontSize.xxl,
      fontWeight: '800',
      color: t.primary,
    },
    streakStatLabel: { fontSize: FontSize.xs, color: t.textSecondary, textAlign: 'center', marginTop: 2 },
    streakDivider: { width: 1, backgroundColor: t.divider },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{profile.spiritualName ?? profile.displayName} 🙏</Text>
          </View>
          <StreakBadge streak={profile.currentStreak} />
        </View>

        {/* ── Quote of the day ── */}
        <Card style={styles.quoteCard}>
          <Ionicons name="leaf-outline" size={18} color={t.primaryStrong} style={{ marginBottom: 4 }} />
          <Text style={styles.quoteText}>
            &ldquo;{quote.text}&rdquo;
          </Text>
          <Text style={styles.quoteSource}>— {quote.source}</Text>
        </Card>

        {/* ── Today's Progress ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today&apos;s Sādhana</Text>
            <Pressable
              style={styles.addBtn}
              onPress={openAddForm}
              accessibilityRole="button"
              accessibilityLabel="Add practice"
            >
              <Ionicons name="add" size={16} color={t.textInverse} />
              <Text style={styles.addBtnLabel}>Add</Text>
            </Pressable>
          </View>
          <View style={styles.progressRow}>
            <ProgressBar value={progress} height={10} />
            <Text style={styles.progressLabel}>{completedCount}/{totalCount}</Text>
          </View>

          {allDone && (
            <View style={styles.doneBanner}>
              <Ionicons name="checkmark-circle" size={18} color={t.success} />
              <Text style={styles.doneBannerText}>All done for today! Hari Om 🌸</Text>
            </View>
          )}
        </View>

        {/* ── Add / edit form ── */}
        {showForm && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{editingId ? 'Edit practice' : 'Add practice'}</Text>
            <Text style={styles.formLabel}>Title (required)</Text>
            <TextInput
              style={styles.formInput}
              value={formTitle}
              onChangeText={setFormTitle}
              placeholder="e.g. Evening Aarti"
              placeholderTextColor={t.textMuted}
            />
            <Text style={styles.formLabel}>Subtitle (optional)</Text>
            <TextInput
              style={styles.formInput}
              value={formSubtitle}
              onChangeText={setFormSubtitle}
              placeholder="e.g. Light a lamp, offer flowers"
              placeholderTextColor={t.textMuted}
            />
            <Text style={styles.formLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.formInput}
              value={formDuration}
              onChangeText={setFormDuration}
              keyboardType="number-pad"
              placeholder="15"
              placeholderTextColor={t.textMuted}
            />
            <Text style={styles.formLabel}>Category</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((c) => {
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
                onPress={handleSaveForm}
                accessibilityRole="button"
                accessibilityLabel="Save practice"
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </Card>
        )}

        <Card>
          {sadhanaItems.map((item, idx) => (
            <View key={item.id}>
              <SadhanaCheckItem item={item} onToggle={handleToggle} />
              <View style={styles.itemActions}>
                <Pressable
                  style={styles.itemAction}
                  onPress={() => openEditForm(item)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${item.title}`}
                >
                  <Ionicons name="pencil" size={14} color={t.textMuted} />
                  <Text style={styles.itemActionLabel}>Edit</Text>
                </Pressable>
                <Pressable
                  style={styles.itemAction}
                  onPress={() => handleDelete(item.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.title}`}
                >
                  <Ionicons name="trash-outline" size={14} color={t.textMuted} />
                  <Text style={styles.itemActionLabel}>Delete</Text>
                </Pressable>
                <View style={styles.itemMoveWrap}>
                  <Pressable
                    style={styles.moveBtn}
                    onPress={() => handleMove(item.id, -1)}
                    disabled={idx === 0}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${item.title} up`}
                  >
                    <Ionicons
                      name="chevron-up"
                      size={18}
                      color={t.textMuted}
                      style={idx === 0 ? styles.moveBtnDisabled : undefined}
                    />
                  </Pressable>
                  <Pressable
                    style={styles.moveBtn}
                    onPress={() => handleMove(item.id, 1)}
                    disabled={idx === sadhanaItems.length - 1}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${item.title} down`}
                  >
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={t.textMuted}
                      style={idx === sadhanaItems.length - 1 ? styles.moveBtnDisabled : undefined}
                    />
                  </Pressable>
                </View>
              </View>
              {idx < sadhanaItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* ── Japa counter (only when a japa practice exists) ── */}
        {hasJapa && (
          <JapaCounter today={today} rounds={japaRounds} onLogRound={handleLogRound} />
        )}

        {/* ── Meditation timer (only when a meditation practice exists) ── */}
        {hasMeditation && (
          <MeditationTimer onComplete={handleMeditationComplete} />
        )}

        {/* ── Streak Summary ── */}
        <Card style={styles.streakCard}>
          <Text style={styles.streakHeading}>Your Journey</Text>
          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <Text style={styles.streakNumber}>{profile.currentStreak}</Text>
              <Text style={styles.streakStatLabel}>Current streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakNumber}>{profile.longestStreak}</Text>
              <Text style={styles.streakStatLabel}>Longest streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakNumber}>{profile.totalDaysCompleted}</Text>
              <Text style={styles.streakStatLabel}>Days completed</Text>
            </View>
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}
