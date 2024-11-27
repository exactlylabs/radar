import { Image, StyleSheet, View } from "react-native";
import Title from "@/components/Title";

import gridImage from '@/assets/images/step2grid-onboarding.png';
import TextComponent from "@/components/TextComponent";
import BgGradient from "@/components/BgGratient";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { sharedStyles } from "@/styles/shared";

export default function Step2() {
    return (
        <BgGradient>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image source={gridImage} />
                </View>
                <View style={styles.titleContainer}>
                    <Title title="Help your community know where broadband fails." />
                </View>
                <View style={styles.textContainer}>
                    <TextComponent 
                        text="Share your discoveries with others and see how their connectivity compares to yours." 
                    />
                </View>

                <View style={styles.dotsContainer}>
                    <View style={styles.dot} />
                    <View style={styles.dotSelected} />
                </View>

                <ButtonContainer>
                    <Button title="Get started" onPress={() => {}} />
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
        backgroundColor: sharedStyles.colors.blue200,
        borderRadius: 5
    },
    dot: {
        width: 8,
        height: 8,
        backgroundColor: sharedStyles.colors.white,
        opacity: 0.2,
        borderRadius: 5,
    }
})