/**
 * Reminder scheduling tests. expo-notifications is a native module, so it is
 * replaced with a virtual mock — these tests pin the permission/branch
 * logic, not the OS layer.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as Notifications from 'expo-notifications';
import { parseReminderTime, rescheduleReminder } from '../src/utils/reminders';

jest.mock(
  'expo-notifications',
  () => ({
    requestPermissionsAsync: jest.fn(),
    cancelAllScheduledNotificationsAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    SchedulableTriggerInputTypes: { DAILY: 'daily' },
  }),
  { virtual: true },
);

type NotifMock = {
  requestPermissionsAsync: jest.Mock<() => Promise<{ status: string }>>;
  cancelAllScheduledNotificationsAsync: jest.Mock<() => Promise<void>>;
  scheduleNotificationAsync: jest.Mock<(request: unknown) => Promise<string>>;
};

const N = Notifications as unknown as NotifMock;

beforeEach(() => {
  jest.clearAllMocks();
  N.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
  N.scheduleNotificationAsync.mockResolvedValue('some-id');
});

describe('parseReminderTime', () => {
  it.each([
    ['06:00', { hour: 6, minute: 0 }],
    ['00:00', { hour: 0, minute: 0 }],
    ['23:59', { hour: 23, minute: 59 }],
  ])('accepts %s', (input, expected) => {
    expect(parseReminderTime(input)).toEqual(expected);
  });

  it.each([['6:00'], ['24:00'], ['06:60'], [''], ['ab:cd'], ['06:00:00'], [' 06:00']])(
    'rejects %s',
    (input) => {
      expect(parseReminderTime(input)).toBeNull();
    },
  );
});

describe('rescheduleReminder', () => {
  it('schedules a daily notification at the parsed time when granted', async () => {
    const ok = await rescheduleReminder(true, '06:30');
    expect(ok).toBe(true);
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(N.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: { title: 'Time for Sādhana', body: 'Your daily practice awaits.' },
      trigger: { type: 'daily', hour: 6, minute: 30 },
    });
  });

  it('returns false and never schedules when permission is denied', async () => {
    N.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    const ok = await rescheduleReminder(true, '06:30');
    expect(ok).toBe(false);
    // Old alerts are still cleared so a stale reminder can't linger.
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels and returns true when reminders are switched off', async () => {
    const ok = await rescheduleReminder(false, '06:30');
    expect(ok).toBe(true);
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('returns false on invalid time instead of scheduling garbage', async () => {
    const ok = await rescheduleReminder(true, '99:99');
    expect(ok).toBe(false);
    expect(N.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('returns false when the native layer throws', async () => {
    N.scheduleNotificationAsync.mockRejectedValue(new Error('nope'));
    const ok = await rescheduleReminder(true, '06:30');
    expect(ok).toBe(false);
  });
});
