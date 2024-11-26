// onboardingStyles.ts
import { StyleSheet } from "react-native";
import { sharedStyles } from "@/styles/shared";

const onboardingStyles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: sharedStyles.colors.blueBackground,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  topContent: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingRight: 50,
    marginTop: 16,
  },
  bottomContent: {
    marginBottom: 20,
  },
});

export default onboardingStyles;
