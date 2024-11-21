import { Image, StyleSheet, Text, View } from "react-native";
import Title from "@/components/Title";

import gridImage from '../../assets/images/step1grid-onboarding.png';
import TextComponent from "@/components/TextComponent";
import BgGradient from "@/components/BgGratient";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { useRouter } from "expo-router";

export default function Step1() {
    const router = useRouter();
    return (
        <BgGradient>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image source={gridImage} />
                </View>
                <View style={styles.titleContainer}>
                    <Title title="Discover how broadband works in your region." />
                </View>
                <View style={styles.textContainer}>
                    <TextComponent 
                        text="Run speed tests and map Wi-Fi hotspots and cell towers around you to understand how broadband performs in your region." 
                    />
                </View>

                <View style={styles.dotsContainer}>
                    <View style={styles.dotSelected} />
                    <View style={styles.dot} />
                </View>

                <ButtonContainer>
                    <Button title="Next" onPress={() => router.push('/step2')} />
                </ButtonContainer>
            </View>
        </BgGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleContainer: {
        paddingHorizontal: 20,
        marginTop: 10
    },
    textContainer: {
        paddingHorizontal: 20,
        paddingRight: 50,
        marginTop: 20
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 150,
        gap: 5,
    },
    dotSelected: {
        width: 8,
        height: 8,
        backgroundColor: '#4B7BE5',
        borderRadius: 5
    },
    dot: {
        width: 8,
        height: 8,
        backgroundColor: '#FFFFFF',
        opacity: 0.2,
        borderRadius: 5,
    }
})