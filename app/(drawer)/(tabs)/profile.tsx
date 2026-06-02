import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';


export default function TabThreeScreen() {
  return (
    <ThemedView style={styles.container}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Profile</ThemedText>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});