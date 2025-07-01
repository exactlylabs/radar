import { Alert, Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Title from "@/components/Title";

import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { AntDesign } from "@expo/vector-icons";

import EmailIcon from '@/assets/images/icons/emailicon.png'
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { colors, fonts } from "@/styles/shared";
import TextComponent from "@/components/TextComponent";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import Animated, {
    withTiming,
    useAnimatedStyle,
    useSharedValue,
    withSequence
} from 'react-native-reanimated';

import { TIMER_DURATIONS } from "@/constants/Timer";
import { sendCode, getToken } from "@/app/http/authentication";

const CELL_COUNT = 6;

export default function AccountValidateCode() {
    const router = useRouter()
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const [isError, setIsError] = useState(false)
    const [countdown, setCountdown] = useState(TIMER_DURATIONS.SEND_NEW_CODE);
    const [canResend, setCanResend] = useState(false);
    const opacity = useSharedValue(0);
    const timerRef = useRef<NodeJS.Timeout>();
    const { email } = useLocalSearchParams();

    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [countdown]);

    const showNotification = () => {
        opacity.value = withSequence(
            withTiming(1, { duration: 300 }),
            withTiming(0, { duration: 5000 }, () => { })
        );
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const handleResendCode = async () => {
        if (canResend) {
            try {
                await sendCode(email as string)

                setCountdown(TIMER_DURATIONS.SEND_NEW_CODE);
                setCanResend(false);
                showNotification();
            } catch (error) {
                console.log(error)
                Alert.alert('something went wrong, try again later')
            }
        }
    };

    const handleContinue = async () => {
        try {
            const response = await getToken(value)

            router.push('/permissions_1_phone_access')
        } catch (error) {
            console.log(error)
            setIsError(true)
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={24} color={colors.gray400} />
                </TouchableOpacity>

                <Image source={EmailIcon} style={styles.emailIcon} />

                <View style={styles.titleContainer}>
                    <Title title="Verify your email" />
                </View>

                <View style={styles.textContainer}>
                    <TextComponent text={`Enter the 6-digit code we’ve sent to ${email}`} />
                </View>

                <CodeField
                    ref={ref}
                    {...props}
                    value={value}
                    onChangeText={setValue}
                    cellCount={CELL_COUNT}
                    rootStyle={styles.codeFieldRoot}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    renderCell={({ index, symbol, isFocused }: { index: number, symbol: string, isFocused: boolean }) => (
                        <Text
                            key={index}
                            style={[styles.cell, isFocused && styles.focusedCell]}
                            onLayout={getCellOnLayoutHandler(index)}>
                            {symbol || (isFocused ? <Cursor /> : null)}
                        </Text>
                    )}
                />

                {isError && (
                    <Text style={styles.errorText}>
                        Your code is not valid.
                    </Text>
                )}

                {canResend ? (
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Haven’t received?</Text>
                        <TouchableOpacity onPress={handleResendCode}>
                            <Text style={styles.resendButton}>
                                Send another code.
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendTitle}>You can send another code in</Text>
                        <Text style={styles.timer}>{countdown} seconds</Text>
                    </View>
                )}

                <Animated.View style={[styles.notificationContainer, animatedStyle]}>
                    <View style={styles.notificationContent}>
                        <AntDesign name="check" size={15} color={colors.white} />
                        <Text style={styles.notificationText}>A new code has been sent.</Text>
                    </View>
                </Animated.View>

                <View style={styles.buttonOnBottom}>
                    <ButtonContainer>
                        <Button title="Continue" onPress={handleContinue} />
                    </ButtonContainer>
                </View>
            </View>
        </View >
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
        marginTop: 40,
        position: 'relative'
    },
    emailIcon: {
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
    textContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
        marginBottom: 60
    },
    codeFieldRoot: {
        marginBottom: 40,
        width: '90%',
    },
    cell: {
        textAlign: 'center',
        color: colors.white,
        width: 50,
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray500,
        fontSize: 28,
        fontFamily: fonts.MulishRegular
    },
    focusedCell: {
        borderBottomColor: colors.blue200,
        borderBottomWidth: 2,
    },
    cellText: {
        fontSize: 28,
        color: colors.white,
        textAlign: 'center',
    },
    timer: {
        fontFamily: fonts.MulishBold,
        color: colors.white,
        fontSize: 14,
    },
    errorText: {
        color: colors.red400,
        fontSize: 14,
        fontFamily: fonts.MulishRegular,
        marginBottom: 40,
        marginTop: -10
    },
    resendContainer: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center'
    },
    resendText: {
        fontSize: 14,
        color: colors.gray400,
        fontFamily: fonts.MulishRegular,
    },
    resendTitle: {
        color: colors.gray400,
    },
    resendButton: {
        fontFamily: fonts.MulishBold,
        color: colors.blue200
    },
    notificationContainer: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    notificationContent: {
        backgroundColor: colors.gray600,
        padding: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    notificationText: {
        fontFamily: fonts.MulishRegular,
        color: colors.white,
        fontSize: 14,
    },
    buttonOnBottom: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
