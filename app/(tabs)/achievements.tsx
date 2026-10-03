/**
 * Achievements Screen
 * Shows unlocked + locked achievements. Avoids "gamification" feel
 * by framing them as milestones on the spiritual path, not trophies.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { Achievement } from '../../src/types';
import { formatDate } from '../../src/utils/date';

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  streak: 'Consistency',
  learning: 'Knowledge',
  service: 'Service',
  sadhana: 'Practice',
  milestone: 'Milestone',
};

export default function AchievementsScreen() {
  const { state } = useStore();
  const { achievements, profile } = state;

  const unlocked = achievements.filter((a) => !!a.unlockedAt);
  const locked = achievements.filter((a) => !a.unlockedAt);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Milestones</Text>
        <Text style={styles.sub}>
          Each milestone is a reminder of the grace that moves through your practice.
        </Text>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{unlocked.length}</Text>
            <Text style={styles.summaryLabel}>Reached</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{locked.length}</Text>
            <Text style={styles.summaryLabel}>Ahead</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{profile.currentStreak}</Text>
            <Text style={styles.summaryLabel}>Day streak</Text>
          </View>
        </Card>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reached</Text>
            {unlocked.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </View>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>On the Path</Text>
            {locked.map((a) => (
              <AchievementCard key={a.id} achievement={a} locked />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AchievementCard({
  achievement,
  locked = false,
}: {
  achievement: Achievement;
  locked?: boolean;
}) {
  return (
    <Card style={[styles.achCard, locked ? styles.achCardLocked : undefined]}>
      <View style={[styles.achIcon, locked ? styles.achIconLocked : undefined]}>
        <Ionicons
          name={(achievement.icon as any) ?? 'star-outline'}
          size={26}
          color={locked ? Colors.textMuted : Colors.gold}
        />
      </View>
      <View style={styles.achInfo}>
        <View style={styles.achTitleRow}>
          <Text style={[styles.achTitle, locked && styles.achTitleLocked]}>
            {achievement.title}
          </Text>
          <Text style={styles.achCategory}>{CATEGORY_LABELS[achievement.category]}</Text>
        </View>
        <Text style={[styles.achDesc, locked && styles.achDescLocked]}>
          {achievement.description}
        </Text>
        {!locked && achievement.unlockedAt && (
          <Text style={styles.achDate}>{formatDate(achievement.unlockedAt)}</Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
  heading: { fontSize: FontSize.hero, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },

  summaryCard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryNumber: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.divider },

  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },

  achCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  achCardLocked: { opacity: 0.6 },
  achIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  achIconLocked: { backgroundColor: Colors.surfaceAlt },
  achInfo: { flex: 1, gap: 4 },
  achTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  achTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  achTitleLocked: { color: Colors.textMuted },
  achCategory: { fontSize: FontSize.xs, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  achDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  achDescLocked: { color: Colors.textMuted },
  achDate: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600', marginTop: 2 },
});
