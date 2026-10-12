/**
 * Onboarding — first-run setup: display name, guide name, practice
 * selection, and daily reminder. Completing it persists the profile,
 * trims the checklist to the chosen practices, saves reminder settings,
 * schedules the daily notification, and routes into the tabs.
 */
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../src/store/sadhanaStore';
import { FontSize, Radius, Spacing, useTheme } from '../src/constants/theme';
import { parseReminderTime, rescheduleReminder } from '../src/utils/reminders';

export default function OnboardingScreen() {
  const { state, dispatch } = useStore();
  const t = useTheme();

  const { profile } = state;

  const [displayName, setDisplayName] = useState(
    profile.displayName === 'Devotee' ? '' : profile.displayName,
  );
  const [guideName, setGuideName] = useState(
    !profile.guideName || profile.guideName === 'Guruji' ? '' : profile.guideName,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    state.sadhanaItems.map((item) => item.id),
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    state.settings.reminderEnabled,
  );
  const [reminderTime, setReminderTime] = useState(
    state.settings.reminderTime,
  );

  const togglePractice = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleContinue = async () => {
    const name = displayName.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter your display name to continue.');
      return;
    }
    const time = reminderTime.trim();
    if (reminderEnabled && !parseReminderTime(time)) {
      Alert.alert(
        'Invalid time',
        'Please enter the reminder time as HH:MM (00:00–23:59), e.g. 06:00.',
      );
      return;
    }
    const guide = guideName.trim();
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      displayName: name,
      guideName: guide ? guide : undefined,
      practiceIds: selectedIds,
    });
    dispatch({
      type: 'UPDATE_SETTINGS',
      patch: { reminderEnabled, reminderTime: time },
    });
    const scheduled = await rescheduleReminder(reminderEnabled, time);
    if (reminderEnabled && !scheduled) {
      Alert.alert(
        'Notifications blocked',
        'You are all set, but reminders need system permission to fire. You can enable them anytime in Settings.',
        [
          { text: 'Continue', style: 'cancel', onPress: () => router.replace('/(tabs)') },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    router.replace('/(tabs)');
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: t.background },
        scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },
        title: { fontSize: FontSize.xxl, fontWeight: '800', color: t.textPrimary },
        subtitle: { fontSize: FontSize.md, color: t.textSecondary },
        sectionTitle: {
          fontSize: FontSize.sm,
          fontWeight: '700',
          color: t.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        card: {
          backgroundColor: t.surface,
          borderRadius: Radius.md,
          padding: Spacing.md,
          gap: Spacing.sm,
        },
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
        practiceRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.xs,
        },
        practiceText: { flex: 1 },
        practiceTitle: { fontSize: FontSize.md, color: t.textPrimary, fontWeight: '600' },
        practiceSubtitle: { fontSize: FontSize.sm, color: t.textMuted },
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
        button: {
          backgroundColor: t.primaryStrong,
          borderRadius: Radius.md,
          paddingVertical: Spacing.md,
          alignItems: 'center',
        },
        buttonLabel: { fontSize: FontSize.lg, fontWeight: '700', color: t.textInverse },
      }),
    [t],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={styles.title}>Welcome to Sādhana</Text>
          <Text style={styles.subtitle}>
            Set up your daily practice in under a minute.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your name</Text>
        <View style={styles.card}>
          <View>
            <Text style={styles.label}>Display name (required)</Text>
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
            <Text style={styles.label}>Guide name (optional)</Text>
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
        </View>

        <Text style={styles.sectionTitle}>Daily practices</Text>
        <View style={styles.card}>
          {state.sadhanaItems.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => togglePractice(item.id)}
                style={styles.practiceRow}
              >
                <Ionicons
                  name={selected ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={selected ? t.primaryStrong : t.textMuted}
                />
                <View style={styles.practiceText}>
                  <Text style={styles.practiceTitle}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={styles.practiceSubtitle}>{item.subtitle}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Daily reminder</Text>
        <View style={styles.card}>
          <View style={styles.reminderRow}>
            <Text style={styles.reminderLabel}>Remind me every day</Text>
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
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleContinue}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
