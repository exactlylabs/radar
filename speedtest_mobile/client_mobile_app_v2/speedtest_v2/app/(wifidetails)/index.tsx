import BackButton from "@/components/BackButton";
import { colors, fonts } from "@/styles/shared";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import WifiGreenIcon from '@/assets/images/icons/wifigreenicon.png'
import SmallTitle from "@/components/SmallTitle";
import Subtitle from "@/components/Subtitle";

import ActiveIndicatorIcon from '@/assets/images/icons/activeindicatoricon.png'
import WifiBlueIcon from '@/assets/images/icons/wifiblueicon.png'
import EyeIcon from '@/assets/images/icons/eyeblue.png'
import ArrowRightIcon from '@/assets/images/icons/arrowrighticon.png'
import SignalIcon from '@/assets/images/icons/signalicon.png'
import InfoBlueIcon from '@/assets/images/icons/infoblueicon.png'

import MapImage from '@/assets/images/icons/mapimage.png'

export default function WifiDetailsScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <BackButton />

                <View style={styles.headerContainer}>
                    <View>
                        <SmallTitle title="Starbucks-2034" />
                        <Subtitle subtitle="Seattle, WA" />
                    </View>

                    <Image source={WifiGreenIcon} width={20} height={20} />
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
                        <Image source={WifiBlueIcon} width={20} height={20} />
                        <Text style={styles.itemTitle}>Wi-Fi</Text>
                    </View>
                    <View style={styles.itemRow}>
                        <Image source={EyeIcon} width={20} height={20} />
                        <Text style={styles.itemTitle}>Seen 5 times</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.buttonItemContainer}>
                    <View style={styles.buttonItemContent}>
                        <Text style={styles.itemLabelText}>Current signal strenght</Text>
                        <View style={[styles.viewRow, { marginTop: 0 }]}>
                            <Image source={SignalIcon} width={20} height={20} />
                            <Text style={styles.itemTitle}>Excellent (-34 dBm)</Text>
                        </View>
                    </View>
                    <Image source={ArrowRightIcon} width={20} height={20} />
                </TouchableOpacity>


                <View style={styles.infoItemContainer}>
                    <View style={styles.buttonItemContent}>
                        <Text style={styles.itemLabelText}>Securityt</Text>
                        <View style={[styles.viewRow, { marginTop: 0 }]}>
                            <Text style={styles.itemTitle}>WPA2 Personal</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Image source={InfoBlueIcon} width={20} height={20} />
                    </TouchableOpacity>
                </View>


                <View style={styles.infoItemContainer}>
                    <View style={styles.buttonItemContent}>
                        <Text style={styles.itemLabelText}>MAC Address</Text>
                        <View style={[styles.viewRow, { marginTop: 0 }]}>
                            <Text style={styles.itemTitle}>00:1a:2b:3c:4d:5e</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Image source={InfoBlueIcon} width={20} height={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoItemContainer}>
                    <View style={styles.buttonItemContent}>
                        <Text style={styles.itemLabelText}>Channel</Text>
                        <View style={[styles.viewRow, { marginTop: 0 }]}>
                            <Text style={styles.itemTitle}>64 (5 GHz, 80 MHz)</Text>
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Image source={InfoBlueIcon} width={20} height={20} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.buttonItemContainer}>
                    <View style={styles.buttonItemContent}>
                        <Text style={[styles.itemTitle, { fontFamily: fonts.MulishBold }]}>203 East Pike Street</Text>
                        <View style={[styles.viewRow, { marginTop: 0 }]}>
                            <Text style={styles.itemTitle}>Seattle, WA 98122</Text>
                        </View>
                    </View>
                    <Image source={ArrowRightIcon} width={20} height={20} />
                </TouchableOpacity>

                <Image source={MapImage} style={styles.mapImage} />

                <TouchableOpacity style={styles.buttonViewMap}>
                    <Text style={styles.buttonViewMapTitle}>View on the map</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginTop: 20
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5
    },
    itemTitle: {
        fontFamily: fonts.MulishRegular,
        fontSize: 16,
        color: colors.white
    },
    buttonItemContainer: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 0.2,
        borderColor: colors.borderColor,
        paddingTop: 20,
        borderBottomWidth: 0.2,
        paddingBottom: 20
    },
    buttonItemContent: {
        alignItems: 'flex-start',
        gap: 10,
        justifyContent: 'flex-start'
    },
    itemLabelText: {
        fontFamily: fonts.MulishRegular,
        fontSize: 16,
        color: colors.gray400
    },
    infoItemContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mapImage: {
        marginTop: 60,
        width: '100%',
        borderRadius: 10
    },
    buttonViewMap: {
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: colors.blue200,
        marginBottom: 20
    },
    buttonViewMapTitle: {
        fontFamily: fonts.MulishBold,
        fontSize: 16,
        color: colors.white
    }
})