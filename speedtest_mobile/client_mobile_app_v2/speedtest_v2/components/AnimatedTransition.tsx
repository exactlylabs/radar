import { Animated } from "react-native";
import { useRef } from "react";
import { useRouter } from "expo-router";

interface AnimatedTransitionProps {
  children: React.ReactNode;
  slideAnim: Animated.Value;
}

export const useAnimatedTransition = (nextRoute: string) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(1)).current;

  const animateAndNavigate = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push(nextRoute);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return { slideAnim, animateAndNavigate };
};

export default function AnimatedTransition({ children, slideAnim }: AnimatedTransitionProps) {
  return (
    <Animated.View style={{ flex: 1, opacity: slideAnim }}>
      {children}
    </Animated.View>
  );
}
