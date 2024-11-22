import { sharedStyles } from "@/styles/shared";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface ButtonProps {
    title: string;
    onPress: () => void;
}

export default function Button({ title, onPress }: ButtonProps) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: sharedStyles.colors.buttonBg,
        padding: 10,
        paddingVertical: 15,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    buttonText: {
        color: sharedStyles.colors.white,
        fontFamily: 'MulishBold',
        fontSize: 16,
    }
})