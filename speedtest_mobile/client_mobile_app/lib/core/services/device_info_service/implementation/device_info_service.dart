import 'dart:math';

import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/services/device_info_service/i_device_info_service.dart';

class DeviceInfoService implements IDeviceInfoService {
  const DeviceInfoService({
    required LocalStorage localStorage,
  }) : _localStorage = localStorage;

  final LocalStorage _localStorage;

  @override
  Future<String> getSessionId() async {
    final sessionId = _localStorage.getSessionId();
    if (sessionId != null) {
      return sessionId;
    }

    final id = _generateId();
    await _localStorage.setSessionId(id);
    return id;
  }

  String _generateId() {
    return String.fromCharCodes(
        Iterable.generate(10, (_) => _chars.codeUnitAt(_rnd.nextInt(_chars.length))));
  }

  static final Random _rnd = Random();
  static const _chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
}
