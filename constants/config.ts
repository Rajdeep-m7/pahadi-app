import { Platform } from 'react-native';

/**
 * For Android Emulator, use 10.0.2.2
 * For iOS Simulator, use localhost
 * For Physical Device, use your computer's local IP address (e.g., 192.168.1.XX)
 */
const DEV_API_URL = Platform.select({
  android: 'https://pahadicollections.com/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

// Replace this with your computer's local IP if testing on a physical device
export const BASE_URL = __DEV__ ? DEV_API_URL : 'https://pahadicollections.com/api/v1';

export const RAZORPAY_KEY_ID = 'rzp_live_T0gKJtIlQJu9r1'; // Replace with your actual Test/Live Key ID
