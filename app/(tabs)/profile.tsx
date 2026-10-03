/**
 * Profile Screen
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { StreakBadge } from '../../src/components/StreakBadge';
import { Colors, FontSize, Radius, Spacing } from '../../src/constants/theme';
import { formatDate } from '../../src/utils/date';

export default function ProfileScreen() {
  const { state } = useStore();
  const { profile } = state;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.displayName}>{profile.displayName}</Text>
          {profile.spiritualName && (
            <Text style={styles.spiritualName}>{profile.spiritualName}</Text>
          )}
          {profile.guideName && (
            <Text style={styles.guideName}>Guide: {profile.guideName}</Text>
          )}
          <StreakBadge streak={profile.currentStreak} />
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <StatRow icon="flame-outline" label="Current streak" value={`${profile.currentStreak} days`} />
          <View style={styles.statDivider} />
          <StatRow icon="trophy-outline" label="Longest streak" value={`${profile.longestStreak} days`} />
          <View style={styles.statDivider} />
          <StatRow icon="calendar-outline" label="Days completed" value={`${profile.totalDaysCompleted}`} />
          <View style={styles.statDivider} />
          <StatRow icon="time-outline" label="Member since" value={formatDate(profile.joinedAt)} />
        </Card>

        {/* Menu */}
        <Card style={styles.menuCard}>
          <MenuItem icon="settings-outline" label="Settings" onPress={() => {}} />
          <View style={styles.statDivider} />
          <MenuItem icon="people-outline" label="Community (coming soon)" onPress={() => {}} disabled />
          <View style={styles.statDivider} />
          <MenuItem icon="flash-outline" label="Learning Battles (coming soon)" onPress={() => {}} disabled />
          <View style={styles.statDivider} />
          <MenuItem icon="notifications-outline" label="Notifications (coming soon)" onPress={() => {}} disabled />
          <View style={styles.statDivider} />
          <MenuItem icon="log-out-outline" label="Sign Out (coming soon)" onPress={() => {}} disabled />
        </Card>

        {/* App version */}
        <Text style={styles.version}>Sādhana v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Ionicons name={icon} size={20} color={Colors.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, (pressed && !disabled) ? { opacity: 0.7 } : undefined]}
      onPress={disabled ? undefined : onPress}
    >
      <Ionicons name={icon} size={20} color={disabled ? Colors.textMuted : Colors.textPrimary} />
      <Text style={[styles.menuLabel, disabled && styles.menuLabelDisabled]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={disabled ? Colors.divider : Colors.textMuted} style={{ marginLeft: 'auto' }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

  avatarWrap: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  displayName: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.textPrimary },
  spiritualName: { fontSize: FontSize.md, color: Colors.textSecondary, fontStyle: 'italic' },
  guideName: { fontSize: FontSize.sm, color: Colors.textMuted },

  statsCard: { gap: Spacing.xs },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  statLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  statValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  statDivider: { height: 1, backgroundColor: Colors.divider },

  menuCard: { gap: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm + 2 },
  menuLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
  menuLabelDisabled: { color: Colors.textMuted },

  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textMuted },
});
