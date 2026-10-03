/**
 * Home Screen — Today's Sādhana + Streak
 */
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { SadhanaCheckItem } from '../../src/components/SadhanaCheckItem';
import { StreakBadge } from '../../src/components/StreakBadge';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Colors, FontSize, Spacing } from '../../src/constants/theme';
import { getGreeting } from '../../src/utils/date';

export default function HomeScreen() {
  const { state, dispatch } = useStore();
  const { sadhanaItems, todayProgress, profile } = state;

  const completedCount = todayProgress.completed.length;
  const totalCount = sadhanaItems.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const allDone = completedCount === totalCount;

  function handleToggle(id: string) {
    dispatch({ type: 'TOGGLE_SADHANA', id });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

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
          <Ionicons name="leaf-outline" size={18} color={Colors.primary} style={{ marginBottom: 4 }} />
          <Text style={styles.quoteText}>
            "Little by little, a person becomes evil, as a water pot is filled by the constant falling of drops."
          </Text>
          <Text style={styles.quoteSource}>— Dhammapada 9.1</Text>
        </Card>

        {/* ── Today's Progress ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Sādhana</Text>
          <View style={styles.progressRow}>
            <ProgressBar value={progress} height={10} />
            <Text style={styles.progressLabel}>{completedCount}/{totalCount}</Text>
          </View>

          {allDone && (
            <View style={styles.doneBanner}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.doneBannerText}>All done for today! Hari Om 🌸</Text>
            </View>
          )}
        </View>

        <Card>
          {sadhanaItems.map((item, idx) => (
            <View key={item.id}>
              <SadhanaCheckItem item={item} onToggle={handleToggle} />
              {idx < sadhanaItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  greeting: { fontSize: FontSize.md, color: Colors.textSecondary },
  name: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },

  quoteCard: { backgroundColor: Colors.surfaceAlt, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  quoteText: { fontSize: FontSize.md, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
  quoteSource: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 6 },

  section: { gap: Spacing.xs },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 32, textAlign: 'right' },

  donebanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginTop: 4,
  },
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
  doneBannerText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '600' },

  divider: { height: 1, backgroundColor: Colors.divider },

  streakCard: {},
  streakHeading: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  streakRow: { flexDirection: 'row', justifyContent: 'space-around' },
  streakStat: { alignItems: 'center', flex: 1 },
  streakNumber: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
  },
  streakStatLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  streakDivider: { width: 1, backgroundColor: Colors.divider },
});
