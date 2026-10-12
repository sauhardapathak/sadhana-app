/**
 * Profile Screen — identity, reminder settings, data tools, and about.
 */
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useStore } from '../../src/store/sadhanaStore';
import { Card } from '../../src/components/Card';
import { StreakBadge } from '../../src/components/StreakBadge';
import { FontSize, Radius, Spacing, useTheme } from '../../src/constants/theme';
import { formatDate } from '../../src/utils/date';
import { parseReminderTime, rescheduleReminder } from '../../src/utils/reminders';

// Placeholder — replace with the real privacy policy URL before release.
const PRIVACY_URL = 'https://sadhana.app/privacy';

export default function ProfileScreen() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const { profile } = state;

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [guideName, setGuideName] = useState(profile.guideName ?? '');
  const [reminderEnabled, setReminderEnabled] = useState(
    state.settings.reminderEnabled,
  );
  const [reminderTime, setReminderTime] = useState(
    state.settings.reminderTime,
  );

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSaveProfile = () => {
    const name = displayName.trim();
    if (!name) {
      Alert.alert('Name required', 'Display name cannot be empty.');
      return;
    }
    const guide = guideName.trim();
    dispatch({
      type: 'UPDATE_PROFILE',
      patch: { displayName: name, guideName: guide ? guide : undefined },
    });
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handleSaveSettings = async () => {
    const time = reminderTime.trim();
    if (reminderEnabled && !parseReminderTime(time)) {
      Alert.alert(
        'Invalid time',
        'Please enter the reminder time as HH:MM (00:00–23:59), e.g. 06:00.',
      );
      return;
    }
    dispatch({ type: 'UPDATE_SETTINGS', patch: { reminderEnabled, reminderTime: time } });
    const scheduled = await rescheduleReminder(reminderEnabled, time);
    if (reminderEnabled && !scheduled) {
      Alert.alert(
        'Notifications blocked',
        'Reminders are on, but the system denied notification permission — nothing will fire until you allow it.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    Alert.alert('Saved', 'Your reminder settings have been updated.');
  };

  const handleExport = async () => {
    try {
      await Share.share({
        message: JSON.stringify(state, null, 2),
        title: 'Sādhana backup',
      });
    } catch {
      Alert.alert('Export failed', 'Could not share your data. Please try again.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset all data?',
      'This will erase all practices, progress, and settings on this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Are you sure?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Reset everything',
                style: 'destructive',
                onPress: () => dispatch({ type: 'RESET_ALL' }),
              },
            ]);
          },
        },
      ],
    );
  };

  const handlePrivacy = async () => {
    try {
      await Linking.openURL(PRIVACY_URL);
    } catch {
      Alert.alert('Could not open link', 'Please try again later.');
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: t.background },
        scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
        avatarWrap: { alignItems: 'center', gap: Spacing.xs, paddingVertical: Spacing.md },
        avatar: {
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: t.primary,
        },
        displayName: { fontSize: FontSize.xl, fontWeight: '800', color: t.textPrimary },
        spiritualName: { fontSize: FontSize.md, color: t.textSecondary, fontStyle: 'italic' },
        guideName: { fontSize: FontSize.sm, color: t.textMuted },
        sectionTitle: {
          fontSize: FontSize.sm,
          fontWeight: '700',
          color: t.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        statsCard: { gap: Spacing.xs },
        statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
        statLabel: { flex: 1, fontSize: FontSize.md, color: t.textSecondary },
        statValue: { fontSize: FontSize.md, fontWeight: '700', color: t.textPrimary },
        statDivider: { height: 1, backgroundColor: t.divider },
        formCard: { gap: Spacing.sm },
        label: { fontSize: FontSize.sm, fontWeight: '600', color: t.textSecondary },
        input: {
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: Radius.sm,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.sm,
          fontSize: FontSize.md,
          color: t.textPrimary,
          backgroundColor: t.background,
        },
        reminderRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        reminderLabel: { fontSize: FontSize.md, color: t.textPrimary, fontWeight: '600' },
        timeInput: {
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: Radius.sm,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.sm,
          fontSize: FontSize.md,
          color: t.textPrimary,
          backgroundColor: t.background,
          width: 96,
          textAlign: 'center',
        },
        saveButton: {
          backgroundColor: t.primaryStrong,
          borderRadius: Radius.md,
          paddingVertical: Spacing.sm + 4,
          alignItems: 'center',
        },
        saveButtonLabel: { fontSize: FontSize.md, fontWeight: '700', color: t.textInverse },
        menuCard: { gap: 0 },
        menuItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.sm + 2,
        },
        menuLabel: { flex: 1, fontSize: FontSize.md, color: t.textPrimary },
        dangerLabel: { flex: 1, fontSize: FontSize.md, color: t.error, fontWeight: '600' },
        version: { textAlign: 'center', fontSize: FontSize.xs, color: t.textMuted },
      }),
    [t],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={t.primary} />
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

        {/* Profile */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <Card style={styles.formCard}>
          <View>
            <Text style={styles.label}>Display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={t.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
          <View>
            <Text style={styles.label}>Guide name</Text>
            <TextInput
              style={styles.input}
              value={guideName}
              onChangeText={setGuideName}
              placeholder="e.g. Guruji"
              placeholderTextColor={t.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={handleSaveProfile}
            style={({ pressed }) => [styles.saveButton, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.saveButtonLabel}>Save profile</Text>
          </Pressable>
        </Card>

        {/* Reminders */}
        <Text style={styles.sectionTitle}>Reminders</Text>
        <Card style={styles.formCard}>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>Daily reminder</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: t.divider, true: t.primary }}
              thumbColor={t.surface}
            />
          </View>
          {reminderEnabled ? (
            <View>
              <Text style={styles.label}>Time (HH:MM)</Text>
              <TextInput
                style={styles.timeInput}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="06:00"
                placeholderTextColor={t.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                returnKeyType="done"
              />
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={handleSaveSettings}
            style={({ pressed }) => [styles.saveButton, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.saveButtonLabel}>Save settings</Text>
          </Pressable>
        </Card>

        {/* Data */}
        <Text style={styles.sectionTitle}>Data</Text>
        <Card style={styles.menuCard}>
          <Pressable
            accessibilityRole="button"
            onPress={handleExport}
            style={({ pressed }) => [styles.menuItem, pressed ? { opacity: 0.7 } : undefined]}
          >
            <Ionicons name="share-outline" size={20} color={t.primaryStrong} />
            <Text style={styles.menuLabel}>Export my data</Text>
            <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
          </Pressable>
          <View style={styles.statDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={handleReset}
            style={({ pressed }) => [styles.menuItem, pressed ? { opacity: 0.7 } : undefined]}
          >
            <Ionicons name="trash-outline" size={20} color={t.error} />
            <Text style={styles.dangerLabel}>Reset all data</Text>
            <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
          </Pressable>
        </Card>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card style={styles.menuCard}>
          <View style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={20} color={t.primaryStrong} />
            <Text style={styles.menuLabel}>Sādhana v{appVersion}</Text>
          </View>
          <View style={styles.statDivider} />
          <Pressable
            accessibilityRole="link"
            onPress={handlePrivacy}
            style={({ pressed }) => [styles.menuItem, pressed ? { opacity: 0.7 } : undefined]}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={t.primaryStrong} />
            <Text style={styles.menuLabel}>Privacy policy</Text>
            <Ionicons name="open-outline" size={16} color={t.textMuted} />
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={staticStyles.statRow}>
      <Ionicons name={icon} size={20} color={t.primaryStrong} />
      <Text style={[staticStyles.statLabel, { color: t.textSecondary }]}>{label}</Text>
      <Text style={[staticStyles.statValue, { color: t.textPrimary }]}>{value}</Text>
    </View>
  );
}

const staticStyles = StyleSheet.create({
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  statLabel: { flex: 1, fontSize: FontSize.md },
  statValue: { fontSize: FontSize.md, fontWeight: '700' },
});
