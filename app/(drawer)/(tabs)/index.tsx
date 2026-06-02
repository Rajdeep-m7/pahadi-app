import { StyleSheet, SafeAreaView, ScrollView, View } from "react-native";
import HeroSlider from "../../../components/home/HeroSlider"
import { ThemedText } from "@/components/themed-text";
import CategorySlider from "@/components/home/CategorySlider";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSlider />
        <CategorySlider />
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">New Arrivals</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  brandText: {
    color: '#fe9a00',
  },
  section: {
    padding: 20,
  }
});