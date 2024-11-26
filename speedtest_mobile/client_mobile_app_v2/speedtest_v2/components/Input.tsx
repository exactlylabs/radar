import { colors } from "@/styles/shared";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import React from 'react';

export type InputProps = TextInputProps;

export default function Input(props: InputProps) {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <TextInput
            {...props}
            style={[
                styles.input, 
                isFocused && styles.inputFocused,
                props.style
            ]}
            placeholderTextColor="#737381"
            onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
            }}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        paddingVertical: 11,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#737381',
        color: colors.white,
        fontSize: 16,
        fontFamily: 'MulishRegular'
    },
    inputFocused: {
        borderBottomColor: colors.blue200,
        borderBottomWidth: 2,
        borderRadius: 0
    }
})