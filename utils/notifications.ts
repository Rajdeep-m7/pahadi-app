import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import * as SecureStore from '@/utils/storage';
import { BASE_URL } from '@/constants/config';

/**
 * Registers the device for push notifications.
 * Requests permission, fetches the Expo Push Token, and registers it on our backend.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // 1. Check and request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PushNotification] Permission not granted by user.');
      return null;
    }

    // 2. Fetch the EAS Project ID from Expo configurations
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('[PushNotification] Missing EAS Project ID in app.json.');
      return null;
    }

    // 3. Get the push token
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenData.data;
    console.log('[PushNotification] Generated Token:', pushToken);

    // 4. Set up the default channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7A',
      });
    }

    // 5. Send the token to the backend
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      await axios.patch(
        `${BASE_URL}/users/push-token`,
        { pushToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('[PushNotification] Push token successfully registered on backend.');
    } else {
      console.log('[PushNotification] Skipped backend sync: No user token found.');
    }

    return pushToken;
  } catch (error) {
    console.error('[PushNotification] Failed to register push token:', error);
    return null;
  }
}
