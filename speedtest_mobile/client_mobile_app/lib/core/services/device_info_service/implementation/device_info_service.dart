import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/services/device_info_service/i_device_info_service.dart';

class DeviceInfoService implements IDeviceInfoService {
  const DeviceInfoService({
    required LocalStorage localStorage,
  }) : _localStorage = localStorage;

  final LocalStorage _localStorage;

  @override
  Future<String> getSessionId() async {
    return _localStorage.getSessionId();
  }
}
