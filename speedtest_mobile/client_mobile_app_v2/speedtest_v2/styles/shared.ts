import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
    colors: {
        white: '#FFFFFF',
        gray400: '#BCBBC7',
        blue200: '#4B7BE5',
        bgGradientPrimary: '#1B1860',
        bgGradientSecondary: '#0B0B1A',
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
});
import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
    colors: {
        white: '#FFFFFF',
        gray400: '#BCBBC7',
        blue200: '#4B7BE5',
        bgGradientPrimary: '#1B1860',
        bgGradientSecondary: '#0B0B1A',
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
});
