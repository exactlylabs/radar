import { colors, fonts } from "@/styles/shared";
import { StyleSheet, Text } from "react-native";

interface SubTitleProps {
    subtitle: string;
}

export default function Subtitle({ subtitle }: SubTitleProps) {
    return (
        <Text style={styles.title}>{subtitle}</Text>
    )
}

export const styles = StyleSheet.create({
    title: {
        fontSize: 16,
        fontFamily: fonts.MulishRegular,
        color: colors.white,
        marginTop: 5
    }
})