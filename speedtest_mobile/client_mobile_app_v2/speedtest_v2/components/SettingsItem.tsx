import { fonts } from "@/styles/shared"
import { colors } from "@/styles/shared"
import { AntDesign } from "@expo/vector-icons"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface SettingsItemProps {
    title: string
    description?: string
}

export function SettingsItem({ title, description }: SettingsItemProps) {
    return (
        <TouchableOpacity style={styles.item}>
            <View style={styles.itemHeader}>    
                <Text style={styles.itemTitle}>{title}</Text>
                <AntDesign name="right" size={16} color={colors.gray400} />
            </View>
            {description && <Text style={styles.itemDescription}>{description}</Text>}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    item: {
        paddingVertical: 20,
        borderBottomWidth: 0.2,
        borderBottomColor: colors.borderColor,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 18,
        fontFamily: fonts.MulishRegular,
        color: colors.white,
    },
    itemDescription: {
        fontSize: 13,
        fontFamily: fonts.MulishRegular,
        color: colors.gray400,
        marginTop: 5,
    }
})