import 'package:cell_network_mapper/bloc/cell_network_state.dart';
import 'package:cell_network_mapper/models/cell_info.dart';
import 'package:cell_network_mapper/models/tower_info.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:network_connection_info/models/connection_info.dart';
import 'package:network_connection_info/network_connection_info.dart';

class CellNetworkCubit extends Cubit<CellNetworkState> {
  CellNetworkCubit({
    required NetworkConnectionInfo networkConnectionInfo,
  })  : _networkConnectionInfo = networkConnectionInfo,
        super(const CellNetworkState()) {
    _loadCellInfo();
  }

  final NetworkConnectionInfo _networkConnectionInfo;

  void _loadCellInfo() async {
    final info = await _networkConnectionInfo.getNetworkConnectionInfo();
    _parseCellInfo(info);
  }

  void _parseCellInfo(ConnectionInfo? info) {
    if (info?.data['dataNetworkType'] == 'LTE') {
      final towerInfo = TowerInfo(
        type: 'MACRO (Not Available)',
        mcc: info?.data['cellIdentity']['mccString'] ?? '',
        mnc: info?.data['cellIdentity']['mncString'] ?? '',
        lac: info?.data['cellIdentity']['tac']?.toString() ?? '',
        bands: List<int>.from(info?.data['cellIdentity']['bands'] ?? []),
      );
      final cellInfo = CellInfo(
        cId: info?.data['cellIdentity']['ci'].toString() ?? '',
        systemSubType: info?.data['dataNetworkType'] ?? '',
        arfcn: info?.data['cellIdentity']['earfcn'].toString() ?? '',
        rsrp: info?.data['signalStrength']['rsrp'].toString() ?? '',
        bandwidth: info?.data['cellIdentity']['bandwidth'].toString() ?? '',
        uplinkFrequency: 'Not Available',
        downlinkFrequency: 'Not Available',
        frequencyBand: 'Not Available',
      );
      emit(CellNetworkState(
        towerInfo: towerInfo,
        cellInfo: cellInfo,
        isLoading: false,
      ));
    }
  }

  Map<String, dynamic> cellInfoJson(ConnectionInfo? info) {
    Map<String, dynamic> json = {};
    if (info?.data['dataNetworkType'] == 'LTE') {
      json['type'] = 'MACRO (Not Available)';
      json['mcc'] = info?.data['cellIdentity']['mccString'] ?? '';
      json['mnc'] = info?.data['cellIdentity']['mncString'] ?? '';
      json['lac'] = info?.data['cellIdentity']['tac']?.toString() ?? '';
      json['bands'] = List<int>.from(info?.data['cellIdentity']['bands'] ?? []);
      json['cId'] = info?.data['cellIdentity']['ci'].toString() ?? '';
      json['systemSubType'] = info?.data['dataNetworkType'] ?? '';
      json['arfcn'] = info?.data['cellIdentity']['earfcn'].toString() ?? '';
      json['rsrp'] = info?.data['signalStrength']['rsrp'].toString() ?? '';
      json['bandwidth'] = info?.data['cellIdentity']['bandwidth'].toString() ?? '';
      json['uplinkFrequency'] = 'Not Available';
      json['downlinkFrequency'] = 'Not Available';
      json['frequencyBand'] = 'Not Available';
    }
  }
}
