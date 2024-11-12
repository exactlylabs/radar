import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


import { NativeModules, Text, View, Button, FlatList, NativeEventEmitter } from 'react-native';
import React, { useEffect, useState } from 'react';

const { CellTowerModule } = NativeModules;

const eventEmitter = new NativeEventEmitter(CellTowerModule);

type CellTowerInfo = {
  type: string;
  signalStrength: number;
  asuLevel?: number;
  rsrp?: number;
  rsrq?: number;
  rssnr?: number;
  mcc: string;
  mnc: string; 
  name: string;
  cellId?: number;
  isRegistered: boolean;
};


export default function TabTwoScreen() {


  const [cellTowerInfo, setCellTowerInfo] = useState<CellTowerInfo[]>([]);
  const [error, setError] = useState<string | null>(null);


  const fetchCellTowerInfo = async () => {
    try {
      const result = await CellTowerModule.getCellTowerInfo();
      console.log(result);
      setCellTowerInfo(result);
    } catch (err) {
      setError('Error fetching cell tower information');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCellTowerInfo();
  }, []);


  useEffect(() => {
    const logListener = eventEmitter.addListener('logEvent', (log) => {
        console.log(log.log); // Show the log in React Native console
    });

    // Fetch cell tower info here
    CellTowerModule.getCellTowerInfo();

    return () => {
        logListener.remove();
    };
}, []);


  const renderCellInfo = ({ item }: { item: CellTowerInfo }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ddd' }}>
      <Text>Type: {item.type}</Text>
      <Text>Signal Strength: {item.signalStrength} dBm</Text>
     {/* <Text>Location: {item.latitude}, {item.longitude}</Text> */ }
      <Text>ASU Level: {item.asuLevel ?? 'N/A'}</Text>
      {item.rsrp !== undefined && <Text>RSRP: {item.rsrp}</Text>}
      {item.rsrq !== undefined && <Text>RSRQ: {item.rsrq}</Text>}
      {item.rssnr !== undefined && <Text>RSSNR: {item.rssnr}</Text>}
      <Text>MCC: {item.mcc}</Text>
      <Text>MNC: {item.mnc}</Text>
      <Text>Cell ID: {item.cellId ?? 'N/A'}</Text>
      <Text>Registered: {item.isRegistered ? 'Yes' : 'No'}</Text>
      <Text>Name: {item.name}</Text>
    </View>
  );

 

  return (
    <View style={{flex: 1, backgroundColor:"white"}}>
 
     
    
     
      <View style={{ flex: 1, padding: 20 }}>
      <Button title="Refresh Cell Tower Info" onPress={fetchCellTowerInfo} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <FlatList
        data={cellTowerInfo}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCellInfo}
      />
    </View>


    </View>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
