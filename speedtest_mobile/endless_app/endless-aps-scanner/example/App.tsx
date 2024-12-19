import * as EndlessAPSScanner from "endless-aps-scanner";
import { AppRegistry, Button, NativeEventEmitter, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

export default function App() {
  const [scanResult, setScanResult] = useState<String>("No data");
  const [status, setStatus] = useState<String>("No data");

  useEffect(() => {
    AppRegistry.registerHeadlessTask('EndlessEvents', () => backgroundTask);
    const backgroundTask = async (event: any) => {
      setScanResult(event.data);
      fetch('https://99f5-181-16-125-31.ngrok-free.app/timestamps', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: event.data
        }),
      });
    };
  }, []);


  // const eventEmitter = new NativeEventEmitter();

  // useEffect(() => {
  //   eventEmitter.addListener(
  //     'ON_ACTION',
  //     event => {
  //       setScanResult(event.data);
  //     },
  //   );

  //   eventEmitter.addListener(
  //     'ON_START',
  //     event => {
  //       setStatus("Service started");
  //     },
  //   );

  //   eventEmitter.addListener(
  //     'ON_STOP',
  //     event => {
  //       setStatus("Service stopped");
  //     },
  //   );
  // });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        {/* <Group name="RequestPermissions">
          <Button title="Request Permissions" onPress={() => alert(EndlessAPSScanner.requestPermissions())} />
        </Group> */}
        <Group name="Status">
          <Text>{status}</Text>
        </Group>
        <Group name="Start service">
          <Button title="Start Service" onPress={() => EndlessAPSScanner.startService()} />
        </Group>
        <Group name="Stop service">
          <Button title="Stop Service" onPress={() => EndlessAPSScanner.stopService()} />
        </Group>
        <Group name="Scan results">
          <Text>{scanResult}</Text>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  view: {
    flex: 1,
    height: 200,
  },
};
