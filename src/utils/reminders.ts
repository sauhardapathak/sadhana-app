/**
 * Daily reminder scheduling (expo-notifications, local only — no server).
 * Single source of truth shared by onboarding and profile settings:
 * exactly one DAILY notification exists at a time.
 *
 * Returns true when reminders are now in the requested state (scheduled, or
 * deliberately off). Returns false when the user asked for reminders but the
 * OS denied permission or scheduling failed — callers MUST surface this,
 * otherwise the user believes a reminder exists that will never fire.
 */
import * as Notifications from 'expo-notifications';

export function parseReminderTime(value: string): { hour: number; minute: number } | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const parts = value.split(':');
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export async function rescheduleReminder(enabled: boolean, time: string): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return true;
    if (status !== 'granted') return false;
    const parsed = parseReminderTime(time);
    if (!parsed) return false;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for Sādhana',
        body: 'Your daily practice awaits.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: parsed.hour,
        minute: parsed.minute,
      },
    });
    return true;
  } catch {
    // Notifications unavailable on this device — settings are still saved.
    return false;
  }
}
