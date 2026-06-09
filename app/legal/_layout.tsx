import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack>
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="shipping" options={{ title: 'Shipping Policy' }} />
      <Stack.Screen name="refund" options={{ title: 'Refund Policy' }} />
    </Stack>
  );
}
