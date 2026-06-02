import { ThemedText } from "@/components/themed-text"
import { ThemedView } from "@/components/themed-view"
import { Fonts } from "@/constants/theme"
import { StyleSheet } from "react-native"

export default function TabFourScreen() {
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>Cart</ThemedText>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})