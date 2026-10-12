/**
 * Learn Screen — Reading with progressive questions
 */
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { DifficultyBadge } from '../../src/components/DifficultyBadge';
import { useTheme, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { Lesson } from '../../src/types';

type Filter = 'all' | 'reading';

export default function LearnScreen() {
  const { state } = useStore();
  const t = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const lessons = state.lessons.filter(
    (l) => filter === 'all' || l.contentType === filter
  );

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
    heading: { fontSize: FontSize.hero, fontWeight: '800', color: t.textPrimary },
    sub: { fontSize: FontSize.md, color: t.textSecondary },

    filterRow: { flexDirection: 'row', gap: Spacing.sm },
    filterTab: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.full,
      backgroundColor: t.surfaceAlt,
    },
    filterTabActive: { backgroundColor: t.primaryStrong },
    filterLabel: { fontSize: FontSize.sm, color: t.textSecondary, fontWeight: '600' },
    filterLabelActive: { color: t.textInverse },

    lessonCard: { gap: Spacing.sm },
    lessonTop: { flexDirection: 'row', gap: Spacing.sm },
    typeIcon: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: t.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lessonInfo: { flex: 1, gap: 2 },
    lessonCategory: { fontSize: FontSize.xs, color: t.primaryStrong, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    lessonTitle: { fontSize: FontSize.lg, fontWeight: '700', color: t.textPrimary },
    lessonDesc: { fontSize: FontSize.sm, color: t.textSecondary },
    lessonFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
    questionCount: { fontSize: FontSize.sm, color: t.textMuted },
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
    completedText: { fontSize: FontSize.sm, color: t.success, fontWeight: '600' },
    empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
    emptyText: { fontSize: FontSize.md, color: t.textMuted },
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.heading}>Learn</Text>
        <Text style={styles.sub}>Deepen your understanding through reading.</Text>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'reading'] as Filter[]).map((f) => (
            <Pressable
              key={f}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Lessons */}
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onPress={() => router.push({ pathname: '/learn/[id]', params: { id: lesson.id } })}
          />
        ))}

        {lessons.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={40} color={t.textMuted} />
            <Text style={styles.emptyText}>No lessons here yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonCard({ lesson, onPress }: { lesson: Lesson; onPress: () => void }) {
  const t = useTheme();
  const firstDifficulty = lesson.questions[0]?.difficulty ?? 'easy';

  const styles = StyleSheet.create({
    lessonCard: { gap: Spacing.sm },
    lessonTop: { flexDirection: 'row', gap: Spacing.sm },
    typeIcon: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: t.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lessonInfo: { flex: 1, gap: 2 },
    lessonCategory: { fontSize: FontSize.xs, color: t.primaryStrong, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    lessonTitle: { fontSize: FontSize.lg, fontWeight: '700', color: t.textPrimary },
    lessonDesc: { fontSize: FontSize.sm, color: t.textSecondary },
    lessonFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
    questionCount: { fontSize: FontSize.sm, color: t.textMuted },
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
    completedText: { fontSize: FontSize.sm, color: t.success, fontWeight: '600' },
  });

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
      <Card style={styles.lessonCard}>
        <View style={styles.lessonTop}>
          <View style={styles.typeIcon}>
            <Ionicons
              name={lesson.contentType === 'reading' ? 'book-outline' : 'headset-outline'}
              size={22}
              color={lesson.contentType === 'reading' ? t.primaryStrong : t.info}
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonCategory}>{lesson.category}</Text>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDesc} numberOfLines={2}>{lesson.description}</Text>
          </View>
        </View>
        <View style={styles.lessonFooter}>
          <DifficultyBadge difficulty={firstDifficulty} />
          <Text style={styles.questionCount}>{lesson.questions.length} questions</Text>
          {lesson.completed ? (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={t.success} />
              <Text style={styles.completedText}>Score: {lesson.score}%</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
          )}
        </View>
      </Card>
    </Pressable>
  );
}
