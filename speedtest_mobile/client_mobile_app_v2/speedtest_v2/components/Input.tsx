import { StyleSheet, TextInput, TextInputProps } from "react-native";

export type InputProps = TextInputProps;

export default function Input(props: InputProps) {
    return (
        <TextInput
            {...props}
            style={[styles.input, props.style]}
            placeholderTextColor="#737381"
        />
    )
}

const styles = StyleSheet.create({
    input: {
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#737381',
        color: '#737381',
        fontSize: 16,
        fontFamily: 'MulishRegular'
    }
})