import { colors, sharedStyles } from "@/styles/shared";
import { StyleSheet, Text } from "react-native";

export default function TextComponent({ text }: { text: string }) {
    return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        color: colors.gray400,
        fontFamily: 'MulishRegular',
        maxWidth: '100%',
        textAlign: 'justify'
    },
});