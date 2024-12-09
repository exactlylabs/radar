import { StyleSheet } from 'react-native';

export const colors = {
    white: '#FFFFFF',
    gray300: '#BCBBC7',
    gray400: '#A09FB7',
    gray500: '#737381',
    gray600: '#58586c',
    blue200: '#4B7BE5',
    blueBackground: '#15152E',
    bgGradientPrimary: '#1B1860',
    bgGradientSecondary: '#0B0B1A',
    red400: '#E54B4B',
    bgPrimary: '#15152E',
    borderColor: '#3F3C70'
}

export const fonts = {
    MulishBold: 'MulishBold',
    MulishRegular: 'MulishRegular',
}

export const sharedStyles = StyleSheet.create({
    colors: {
        white: colors.white,
        gray400: colors.gray400,
        blue200: colors.blue200,
        blueBackground: colors.blueBackground,
        bgGradientPrimary: colors.bgGradientPrimary,
        bgGradientSecondary: colors.bgGradientSecondary,
    },
    titleContainer: {
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 16,
        width: "100%",
    },
    headerImageContainer: {
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    reactLogo: {
        height: 178,
        width: 290,
    },
    networkListContainer: {
        width: "100%",
        gap: 12,
    },
    networkCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        width: "100%",
    },
    networkHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    networkName: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
        flexShrink: 1,
    },
    signalBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    signalText: {
        color: "white",
        fontSize: 12,
        fontWeight: "500",
    },
    networkDetails: {
        gap: 4,
    },
    detailText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
    },
    customButton: {
        backgroundColor: "#1E196D",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        width: "100%",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(30, 25, 109, 0.2)",
        shadowColor: "#1E196D",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    errorCard: {
        backgroundColor: 'rgba(244, 67, 54, 0.15)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    errorText: {
        color: '#f44336',
        textAlign: 'center',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        marginTop: 108,
        width: "100%",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: colors.blue200,
    },
});
