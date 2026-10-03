/**
 * Learn Screen — Reading + Listening with progressive questions
 */
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { DifficultyBadge } from '../../src/components/DifficultyBadge';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { Lesson, ContentType } from '../../src/types';

type Filter = 'all' | ContentType;

export default function LearnScreen() {
  const { state } = useStore();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');

  const lessons = state.lessons.filter(
    (l) => filter === 'all' || l.contentType === filter
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Text style={styles.heading}>Learn</Text>
        <Text style={styles.sub}>Deepen your understanding through reading and listening.</Text>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['all', 'reading', 'listening'] as Filter[]).map((f) => (
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
            <Ionicons name="book-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No lessons here yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonCard({ lesson, onPress }: { lesson: Lesson; onPress: () => void }) {
  const firstDifficulty = lesson.questions[0]?.difficulty ?? 'easy';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.8 }]}>
      <Card style={styles.lessonCard}>
        <View style={styles.lessonTop}>
          <View style={[styles.typeIcon, lesson.contentType === 'listening' && styles.typeIconAudio]}>
            <Ionicons
              name={lesson.contentType === 'reading' ? 'book-outline' : 'headset-outline'}
              size={22}
              color={lesson.contentType === 'reading' ? Colors.primary : Colors.info}
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
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.completedText}>Score: {lesson.score}%</Text>
            </View>
          ) : (
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  heading: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary },

  filterRow: { flexDirection: 'row', gap: Spacing.sm },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  filterLabelActive: { color: Colors.surface },

  lessonCard: { gap: Spacing.sm },
  lessonTop: { flexDirection: 'row', gap: Spacing.sm },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconAudio: { backgroundColor: '#EAF3FB' },
  lessonInfo: { flex: 1, gap: 2 },
  lessonCategory: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  lessonTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  lessonDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  lessonFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  questionCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  completedText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '600' },
  empty: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
