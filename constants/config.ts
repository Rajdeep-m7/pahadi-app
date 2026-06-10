import { Platform } from 'react-native';

/**
 * For Android Emulator, use 10.0.2.2
 * For iOS Simulator, use localhost
 * For Physical Device, use your computer's local IP address (e.g., 192.168.1.XX)
 */
const DEV_API_URL = Platform.select({
  android: 'http://192.168.1.16:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

// Replace this with your computer's local IP if testing on a physical device
export const BASE_URL = __DEV__ ? DEV_API_URL : 'https://pahadicollectiononrender.com/api/v1';

export const RAZORPAY_KEY_ID = 'rzp_test_SkO9KqYK8POnNr'; // Replace with your actual Test/Live Key ID
