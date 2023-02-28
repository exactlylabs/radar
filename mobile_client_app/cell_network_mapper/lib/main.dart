import 'package:cell_network_mapper/bloc/cell_network_cubit.dart';
import 'package:cell_network_mapper/bloc/cell_network_state.dart';
import 'package:cell_network_mapper/widgets/header_card.dart';
import 'package:cell_network_mapper/widgets/info_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:network_connection_info/network_connection_info.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatelessWidget {
  const MyHomePage({
    Key? key,
    required this.title,
  }) : super(key: key);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: Text(title)),
      body: BlocProvider(
        create: (context) => CellNetworkCubit(networkConnectionInfo: NetworkConnectionInfo()),
        child: BlocBuilder<CellNetworkCubit, CellNetworkState>(
          builder: (context, state) {
            if (state.isLoading) {
              return const Center(child: CircularProgressIndicator());
            } else {
              return ListView(
                children: [
                  const HeaderCard(title: 'Tower'),
                  InfoCard(name: 'MCC', value: state.towerInfo?.mcc ?? '', moreInfo: 'Mobile Country Code'),
                  InfoCard(name: 'MNC', value: state.towerInfo?.mnc ?? '', moreInfo: 'Mobile Network Code'),
                  InfoCard(name: 'LAC', value: state.towerInfo?.lac ?? '', moreInfo: 'Location Area Code'),
                  InfoCard(name: 'Bands', value: state.towerInfo?.bands.toString() ?? '', moreInfo: 'Bands'),
                  const HeaderCard(title: 'Cell'),
                  InfoCard(name: 'CID', value: state.cellInfo?.cId ?? '', moreInfo: 'Cell ID'),
                  InfoCard(
                      name: 'System Sub Type', value: state.cellInfo?.systemSubType ?? '', moreInfo: 'System Sub Type'),
                  InfoCard(
                      name: 'ARFCN',
                      value: state.cellInfo?.arfcn.toString() ?? '',
                      moreInfo: 'Absolute Radio Frequency Channel Number'),
                  InfoCard(
                      name: 'RSRP',
                      value: state.cellInfo?.rsrp.toString() ?? '',
                      moreInfo: 'Reference Signal Received Power'),
                  InfoCard(name: 'Bandwidth', value: state.cellInfo?.bandwidth.toString() ?? '', moreInfo: 'Bandwidth'),
                  InfoCard(
                      name: 'Uplink Frequency',
                      value: state.cellInfo?.uplinkFrequency.toString() ?? '',
                      moreInfo: 'Uplink Frequency'),
                  InfoCard(
                      name: 'Downlink Frequency',
                      value: state.cellInfo?.downlinkFrequency.toString() ?? '',
                      moreInfo: 'Downlink Frequency'),
                  InfoCard(
                      name: 'Frequency Band',
                      value: state.cellInfo?.frequencyBand.toString() ?? '',
                      moreInfo: 'Frequency Band'),
                ],
              );
            }
          },
        ),
      ),
    );
  }
}
