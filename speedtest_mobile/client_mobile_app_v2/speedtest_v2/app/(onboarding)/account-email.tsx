import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Title from "@/components/Title";

import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { AntDesign } from "@expo/vector-icons";

import UserIcon from '@/assets/images/icons/usericon.png'
import Input from "@/components/Input";
import InfoIcon from '@/assets/images/icons/infoicon.png'
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { isValidEmail } from "@/src/utils/validateEmail";
import { colors, fonts } from "@/styles/shared";
import { api } from "@/src/api/api";
import { sendCode } from "../http/sendCode";

export default function AccountEmail() {
    const router = useRouter()
    const emailRef = useRef('')
    const [error, setError] = useState('')

    const handleContinue = async () => {
        if (isValidEmail(emailRef.current)) {
            setError('')

            try {
                const response = await sendCode(emailRef.current)

                if (response.status === 202) {
                    router.push({
                        pathname: '/account-validate-code',
                        params: { email: emailRef.current }
                    })
                }
            } catch (error) {
                console.log(error)
            }
        } else {
            setError('Invalid email format')
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={24} color={colors.gray400} />
                </TouchableOpacity>

                <Image source={UserIcon} style={styles.userIcon} />

                <View style={styles.titleContainer}>
                    <Title title="Keep your speed test history and findings with an account" />
                </View>

                <View style={styles.inputContainer}>
                    <Input
                        placeholder="Enter your email address"
                        onChangeText={(text) => emailRef.current = text}
                    />
                    {error && (
                        <Text style={styles.errorText}>
                            Your email address is not valid.
                        </Text>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <Image source={InfoIcon} style={styles.infoIcon} />
                    <Text style={styles.infoText}>Already have an account? Make sure you enter the same email address.</Text>
                </View>

                <ButtonContainer>
                    <Button title="Continue" onPress={handleContinue} />
                </ButtonContainer>

                <View style={styles.privacyContainer}>
                    <Text style={styles.privacyText}>By proceeding, you agree to the Privacy Policy.</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 40
    },
    userIcon: {
        width: 70,
        height: 70,
        marginTop: 40
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleContainer: {
        marginTop: 40
    },
    inputContainer: {
        marginTop: 40
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        fontFamily: fonts.MulishRegular
    },
    infoContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        marginBottom: 200
    },
    infoIcon: {
        width: 20,
        height: 20,
        marginTop: 10
    },
    infoText: {
        color: colors.gray500,
        fontSize: 14,
        fontFamily: fonts.MulishRegular,
        maxWidth: '90%'
    },
    privacyContainer: {
        marginTop: 10,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    privacyText: {
        color: colors.gray500,
        fontSize: 14,
        fontFamily: fonts.MulishRegular
    }
})