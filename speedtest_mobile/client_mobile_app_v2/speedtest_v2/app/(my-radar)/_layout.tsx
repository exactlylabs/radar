import { RadarIcon } from "@/components/Icons";
import { colors, fonts, iconStyles } from "@/styles/shared";
import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";
import { sharedStyles } from "@/styles/shared";

export default function MyRadarLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBackground,
                    borderTopWidth: 0,
                    height: 70
                },
                tabBarLabelStyle: {
                    fontFamily: fonts.MulishBold,
                },
                tabBarActiveTintColor: colors.blue200,
                tabBarInactiveTintColor: colors.gray300,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'My Radar',
                    tabBarIcon: ({ color }) => (
                        <Image
                            source={require('@/assets/images/icons/radartabicon.png')}
                            style={[iconStyles.icon24, { tintColor: color }]}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="speedtests"
                options={{
                    title: 'Speed Tests',
                    tabBarIcon: ({ color }) => (
                        <Image
                            source={require('@/assets/images/icons/speedtesticon.png')}
                            style={[iconStyles.icon24, { tintColor: color }]}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => (
                        <Image
                            source={require('@/assets/images/icons/exploretabicon.png')}
                            style={[iconStyles.icon24, { tintColor: color }]}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}
