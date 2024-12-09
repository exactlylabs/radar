import { SettingsItem } from "@/components/SettingsItem";
import Title from "@/components/Title";
import { colors, fonts } from "@/styles/shared";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ArrowLeftIcon from '@/assets/images/icons/arrowbackicon.png'

export default function Settings() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image source={ArrowLeftIcon} width={30} height={30} />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Title title="Settings" />
                </View>

                <View style={styles.itemsContainer}>
                    <Text style={styles.label}>ACCOUNT</Text>
                    <SettingsItem
                        title="Account settings"
                        description="diogo@exactlylabs.com"
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
})