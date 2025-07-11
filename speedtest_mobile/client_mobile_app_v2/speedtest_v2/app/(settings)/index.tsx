import { SettingsItem } from "@/components/SettingsItem";
import Title from "@/components/Title";
import { colors, fonts, sharedStyles } from "@/styles/shared";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ArrowLeftIcon from '@/assets/images/icons/arrowbackicon.png'
import ArrowRightBlueIcon from '@/assets/images/icons/arrowrightblueicon.png'
import CloseIcon from '@/assets/images/icons/closeicon.png'
import { useState } from "react";

export default function Settings() {
    // TODO: implement save of data and submit to backend
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(true);
    const router = useRouter();
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="arrowleft" size={24} color={colors.gray400} />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Title title="Settings" />
                </View>

                {isProfileIncomplete && (
                    <View style={styles.profileContainer}>
                        <TouchableOpacity style={styles.profileCloseButton} onPress={() => setIsProfileIncomplete(false)}>
                            <Image source={CloseIcon} width={20} height={20} />
                        </TouchableOpacity>
                        <Text style={styles.profileText}>Help us understand how you're connected to the Internet.</Text>
                        <View style={styles.profileDivider} />
                        <TouchableOpacity style={styles.profileButton}>
                            <Text style={styles.profileButtonText}>
                                Complete your profile
                            </Text>
                            <Image source={ArrowRightBlueIcon} width={20} height={20} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.itemsContainer}>
                    <Text style={styles.label}>ACCOUNT</Text>
                    <SettingsItem
                        title="Account settings"
                        description="user@example.com"
                    />
                </View>

                <View style={styles.itemsContainer}>
                    <Text style={styles.label}>RADAR</Text>
                    <SettingsItem
                        title="Data cap"
                        description="Radar is using a data cap."
                    />
                </View>

                <View style={styles.itemsContainer}>
                    <Text style={styles.label}>ADDITIONAL INFORMATION</Text>
                    <SettingsItem
                        title="Home location"
                    />
                    <SettingsItem
                        title="Fixed broadband"
                    />
                    <SettingsItem
                        title="Mobile broadband"
                    />
                </View>

                <TouchableOpacity style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Log out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    titleContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    itemsContainer: {
        marginTop: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.MulishBold,
        color: colors.gray400,
        marginBottom: 5,
        marginTop: 10
    },
    logoutButton: {
        paddingVertical: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.borderColor,
        marginTop: 40,
    },
    logoutButtonText: {
        fontSize: 16,
        fontFamily: fonts.MulishBold,
        color: colors.red400,
    },
    profileContainer: {
        marginTop: 20,
        backgroundColor: colors.bgSecondary,
        padding: 20,
        borderRadius: 10,
    },
    profileText: {
        fontSize: 16,
        fontFamily: fonts.MulishRegular,
        color: colors.white,
        maxWidth: 250,
    },
    profileDivider: {
        borderBottomWidth: 0.5,
        borderBottomColor: colors.borderColor,
        marginTop: 20,
    },
    profileButton: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: 350,
        gap: 10,
    },
    profileButtonText: {
        fontSize: 16,
        fontFamily: fonts.MulishBold,
        color: colors.blue200,
    },
    profileCloseButton: {
        position: 'absolute',
        right: 10,
        top: 10,
    }
})
