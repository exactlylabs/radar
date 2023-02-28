import 'package:cell_network_mapper/models/cell_info.dart';
import 'package:cell_network_mapper/models/tower_info.dart';

class CellNetworkState {
  const CellNetworkState({
    this.cellInfo,
    this.towerInfo,
    this.isLoading = false,
  });

  final bool isLoading;
  final TowerInfo? towerInfo;
  final CellInfo? cellInfo;
}
