import { SettingsItem } from "@/components/SettingsItem";
import Title from "@/components/Title";
import { colors, fonts } from "@/styles/shared";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View, Modal } from "react-native";
import ArrowLeftIcon from '@/assets/images/icons/arrowbackicon.png'
import { useState } from "react";
import CloseIcon from '@/assets/images/icons/closeicon.png'

export default function Settings() {
    const router = useRouter();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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
                        description="demo@example.com"
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

                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={() => setShowLogoutModal(true)}
                >
                    <Text style={styles.logoutButtonText}>Log out</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showLogoutModal}
                transparent={true}
                animationType="slide"
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowLogoutModal(false)}
                >
                    <View style={styles.modalContent}>
                        {/* <View style={styles.modalHandle} /> */}
                        <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowLogoutModal(false)}>
                            <Image source={CloseIcon} width={20} height={20} />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Log out</Text>
                        <Text style={styles.modalDescription}>
                            Are you sure you want to log out?
                        </Text>
                        <Text style={styles.modalSubtext}>
                            Logging out will not delete your existing speed test history or findings.
                        </Text>

                        <TouchableOpacity 
                            style={styles.logoutModalButton}
                            onPress={() => {
                                // Add your logout logic here
                                setShowLogoutModal(false);
                            }}
                        >
                            <Text style={styles.logoutModalButtonText}>Log out</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => setShowLogoutModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.modalBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 16,
        width: '100%',
    },
    modalHandle: {
        width: 32,
        height: 4,
        backgroundColor: colors.gray400,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: fonts.MulishBold,
        color: colors.white,
        marginBottom: 16,
        marginTop: 20,
    },
    modalDescription: {
        fontSize: 16,
        fontFamily: fonts.MulishRegular,
        color: colors.gray300,
        marginBottom: 8,
    },
    modalSubtext: {
        fontSize: 14,
        fontFamily: fonts.MulishRegular,
        color: colors.gray400,
        marginBottom: 24,
    },
    logoutModalButton: {
        backgroundColor: colors.blue200,
        borderRadius: 100,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    logoutModalButtonText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: fonts.MulishBold,
    },
    cancelButton: {
        borderRadius: 100,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.blue200,
    },
    cancelButtonText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: fonts.MulishBold,
    },
    modalCloseButton: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
})