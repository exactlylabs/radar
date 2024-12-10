import BackButton from "@/components/BackButton";
import { colors, fonts } from "@/styles/shared";
import { Image, StyleSheet, Text, View } from "react-native";

import WifiGreenIcon from '@/assets/images/icons/wifigreenicon.png'
import SmallTitle from "@/components/SmallTitle";
import Subtitle from "@/components/Subtitle";

import ActiveIndicatorIcon from '@/assets/images/icons/activeindicatoricon.png'

export default function WifiDetailsScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <BackButton />

                <View style={styles.headerContainer}>
                    <View>
                        <SmallTitle title="Starbucks-2034"/>
                        <Subtitle subtitle="Seattle, WA"/>
                    </View>

                    <Image source={WifiGreenIcon} width={20} height={20}/>
                </View>

                <View style={styles.labelContainer}>
                    <Image source={ActiveIndicatorIcon} />
                    <Text style={styles.labelText}>Currently detected</Text>
                </View>

                <View style={styles.labelContainer}>
                    <Text style={styles.labelText}>First seen: 10/20/2023</Text>
                </View>

                <View style={styles.viewRow}>
                    <View style={styles.itemRow}>
                        
                    </View>
                </View>
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
        marginTop: 50
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20
    },
    labelContainer: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        marginTop: 10
    },
    labelText: {
        display: 'flex',
        alignItems: 'baseline',
        color: colors.gray400,
        fontFamily: fonts.MulishRegular,
        fontSize: 15
    },
    viewRow: {
        flexDirection: 'row'
    },
    itemRow: {
        flexDirection: 'row'
    }
})