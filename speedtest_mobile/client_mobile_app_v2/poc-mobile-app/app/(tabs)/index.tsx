import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { useState, useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';

import { View, Text, Button } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';


import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Alert } from 'react-native';

import { startService, stopService } from '../foregroundService/foregroundService';

interface WifiNetwork {
  SSID: string;
  level: number; // Signal strength
  frequency: number;
  capabilities: string
  // Add more properties if needed based on the actual data structure
}

export default function HomeScreen() {


  const [wifiList, setWifiList] = useState<WifiNetwork[]>([]);


  const requestPermissions = async () => {
    try {
      // Request permission for Android (adjust as necessary for iOS)
      if (Platform.OS === 'android') {
        const wifiPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const cellPermission = await request(PERMISSIONS.ANDROID.READ_PHONE_STATE);

        if (wifiPermission === RESULTS.GRANTED && cellPermission === RESULTS.GRANTED) {
          console.log('Permissions granted');
        } else {
          Alert.alert('Permissions required', 'Please grant the necessary permissions to access WiFi and cellular information.');
        }
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  useEffect(() => {
    requestPermissions();
    startService();


    return () => {
      stopService();  
  };

  }, []);



  const fetchWifiNetworks = async () => {
    console.log("scanning")
    try {
      const wifiNetworks = await WifiManager.reScanAndLoadWifiList();
      setWifiList(wifiNetworks);
      console.log(wifiNetworks)
    } catch (error) {
      console.error('Error fetching WiFi networks:', error);
    }
  };


  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        
      <Button title="Scan WiFi Networks" onPress={fetchWifiNetworks} />

      <View style={{flexDirection:"column", width: "100%"}}>
      {wifiList.map((wifi, index) => (
        <View style={{flex: 1, width: "100%"}} key={index}>
        <Text style={{color:"white"}}>{wifi.SSID} - Signal: {wifi.level} - Frequency: {wifi.frequency} - Capabilities: {wifi.capabilities}</Text></View>
      ))}
      </View>


      </ThemedView>
 
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
