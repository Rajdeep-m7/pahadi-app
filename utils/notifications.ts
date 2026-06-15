import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import * as SecureStore from '@/utils/storage';
import { BASE_URL } from '@/constants/config';

/**
 * Registers the device for push notifications via Firebase.
 * Requests permission, fetches the FCM Token, and registers it on our backend.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // 1. Request notification permissions
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('[PushNotification] Permission not granted by user.');
      return null;
    }
    
    // Android 13+ requires explicit POST_NOTIFICATIONS permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('[PushNotification] POST_NOTIFICATIONS permission not granted.');
        return null;
      }
    }

    // 2. Get the raw FCM push token
    const pushToken = await messaging().getToken();
    console.log('[PushNotification] Generated FCM Token:', pushToken);

    // 3. Send the token to the backend
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      await axios.patch(
        `${BASE_URL}/users/push-token`,
        { pushToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('[PushNotification] FCM token successfully registered on backend.');
    } else {
      console.log('[PushNotification] Skipped backend sync: No user token found.');
    }

    return pushToken;
  } catch (error) {
    console.error('[PushNotification] Failed to register FCM token:', error);
    return null;
  }
}
