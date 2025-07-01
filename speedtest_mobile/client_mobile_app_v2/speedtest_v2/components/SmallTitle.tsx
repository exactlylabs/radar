import { colors, fonts } from "@/styles/shared";
import { StyleSheet, Text } from "react-native";

interface SmallTitleProps {
    title: string;
}

export default function SmallTitle({ title }: SmallTitleProps) {
    return (
        <Text style={styles.title}>{title}</Text>
    )
}

export const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontFamily: fonts.MulishBold,
        color: colors.white
    }
})