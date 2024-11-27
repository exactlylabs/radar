import { StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { colors, sharedStyles } from "@/styles/shared";

export default function BgGradient({ children }: { children: React.ReactNode }) {
    return (
        <LinearGradient
            colors={[colors.bgGradientPrimary, sharedStyles.colors.bgGradientSecondary]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            {children}
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})