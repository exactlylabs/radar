import 'package:network_connection_info/models/connection_info.dart';
import 'package:network_connection_info/network_connection_info_platform_interface.dart';

class NetworkConnectionInfo {
  Future<ConnectionInfo?> getNetworkConnectionInfo() {
    return NetworkConnectionInfoPlatform.instance.getNetworkConnectionInfo();
  }

  Future<ConnectionInfo?> getCellularNetworkConnectionInfo() {
    return NetworkConnectionInfoPlatform.instance.getCellularNetworkConnectionInfo();
  }

  Future<List<Map<String, dynamic>>> getWifiNetworkList() {
    return NetworkConnectionInfoPlatform.instance.getWifiNetworkList();
  }
}
