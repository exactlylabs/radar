import { sharedStyles } from "@/styles/shared";
import { StyleSheet, Text } from "react-native";

type TextComponentProps = {
    text: string;
    centered?: boolean;
}

export default function TextComponent({ text, centered = false }: TextComponentProps) {
    return <Text style={[styles.text, centered && styles.centered]}>{text}</Text>;
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        color: sharedStyles.colors.gray400,
        fontFamily: 'MulishRegular',
        maxWidth: '100%',
        textAlign: 'justify'
    },
    centered: {
        textAlign: 'center'
    }
});