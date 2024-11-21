import { StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function BgGradient({ children }: { children: React.ReactNode }) {
    return (
        <LinearGradient
            colors={['#1B1860', '#0B0B1A']}
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