import { Button, SafeAreaView, ScrollView, Text, StyleSheet } from "react-native";

export default function App() {
  return (
    <SafeAreaView>
      <ScrollView>
        <Text>Radar - Endless Service 🚀</Text>
        <Button
          title="Start service"
          onPress={async () => {
            // await ForegroundService.start();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
