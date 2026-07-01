import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests permissions for push/local notifications.
 * @returns Promise<boolean> true if granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7A',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * Schedules local notifications for a meeting.
 * Schedules one at the meeting time,
 * another notification 5 minutes before the meeting time (if it's in the future),
 * and one immediately to confirm the schedule.
 * 
 * @param title The title/purpose of the meeting
 * @param date The meeting date/time
 */
export async function scheduleMeetingNotification(title: string, date: Date) {
  if (Platform.OS === 'web') return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted. Cannot schedule meeting notification.');
    return;
  }

  const now = new Date();

  // 1. Notification at the start time of the meeting (if in the future)
  if (date > now) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Meeting Started',
          body: `"${title}" started now.`,
          sound: true,
          data: { type: 'meeting' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: date,
        },
      });
      console.log('Successfully scheduled start-time meeting notification for:', date.toString());
    } catch (error) {
      console.warn('Error scheduling meeting start-time notification:', error);
    }
  }

  // 2. Notification 5 minutes before the meeting (if 5 mins before is in the future)
  const reminderTime = new Date(date.getTime() - 5 * 60 * 1000);
  if (reminderTime > now) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Meeting Reminder',
          body: `"${title}" starts in 5 minutes.`,
          sound: true,
          data: { type: 'meeting' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });
      console.log('Successfully scheduled 5-minute meeting reminder for:', reminderTime.toString());
    } catch (error) {
      console.warn('Error scheduling meeting reminder notification:', error);
    }
  }

  // 3. Immediate Notification to confirm scheduling
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Meeting Scheduled',
        body: `"${title}" has been successfully scheduled.`,
        sound: true,
        data: { type: 'meeting' },
      },
      trigger: null,
    });
    console.log('Successfully sent immediate meeting confirmation notification');
  } catch (error) {
    console.warn('Error sending immediate meeting confirmation notification:', error);
  }
}

/**
 * Schedules local notifications for a task.
 * Schedules one at the task due time,
 * another notification 5 minutes before the due time (if it's in the future),
 * and one immediately to confirm the schedule.
 * 
 * @param title The title of the task
 * @param date The task due date/time
 */
export async function scheduleTaskNotification(title: string, date: Date) {
  if (Platform.OS === 'web') return;

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.warn('Notification permission not granted. Cannot schedule task notification.');
    return;
  }

  const now = new Date();

  // 1. Notification at the due date of the task (if in the future)
  if (date > now) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Due',
          body: `Task: "${title}" is due now!`,
          sound: true,
          data: { type: 'task' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: date,
        },
      });
      console.log('Successfully scheduled due-time task notification for:', date.toString());
    } catch (error) {
      console.warn('Error scheduling task due-time notification:', error);
    }
  }

  // 2. Notification 5 minutes before the due time (if 5 mins before is in the future)
  const reminderTime = new Date(date.getTime() - 5 * 60 * 1000);
  if (reminderTime > now) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: `Task: "${title}" is due in 5 minutes!`,
          sound: true,
          data: { type: 'task' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });
      console.log('Successfully scheduled 5-minute task reminder for:', reminderTime.toString());
    } catch (error) {
      console.warn('Error scheduling task reminder notification:', error);
    }
  }

  // 3. Immediate Notification to confirm scheduling
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Task Scheduled',
        body: `Task "${title}" has been successfully scheduled.`,
        sound: true,
        data: { type: 'task' },
      },
      trigger: null,
    });
    console.log('Successfully sent immediate task confirmation notification');
  } catch (error) {
    console.warn('Error sending immediate task confirmation notification:', error);
  }
}
