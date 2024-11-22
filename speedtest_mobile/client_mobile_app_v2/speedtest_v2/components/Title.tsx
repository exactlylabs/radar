import { sharedStyles } from "@/styles/shared";
import { StyleSheet, Text } from "react-native";

interface TitleProps {
    title: string;
}

export default function Title({ title }: TitleProps) {
    return <Text style={styles.title}>{title}</Text>;
}

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        color: sharedStyles.colors.white,
        fontFamily: 'MulishBold',
        maxWidth: '90%',
    },
});