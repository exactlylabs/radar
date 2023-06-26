import 'dart:async';

import 'package:client_mobile_app/core/models/warning.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:configuration_monitoring/models/configuration_status.dart';

class WarningService implements IWarningsService {
  WarningService({
    required ConfigurationMonitoring configurationMonitoring,
  }) : _configurationMonitoring = configurationMonitoring {
    _addListenerToConfigurationMonitoring();
  }

  final ConfigurationMonitoring _configurationMonitoring;
  final StreamController<List<Warning>> _warningsStreamController =
      StreamController<List<Warning>>.broadcast();

  final List<Warning> _currentWarnings = [];

  @override
  Future<void> getWarnings() async {
    final warnings = <Warning>[];

    final gpsProvider = await _configurationMonitoring.getGPSProviderStatus();
    final gpsProviderWarning = _parseConfigurationStatusToWarning(gpsProvider);
    if (gpsProviderWarning != null) {
      warnings.add(gpsProviderWarning);
    }

    final powerModeSave = await _configurationMonitoring.getPowerModeSaveStatus();
    final powerModeSaveWarning = _parseConfigurationStatusToWarning(powerModeSave);
    if (powerModeSaveWarning != null) {
      warnings.add(powerModeSaveWarning);
    }

    final airplaneMode = await _configurationMonitoring.getAirplaneModeStatus();
    final airplaneModeWarning = _parseConfigurationStatusToWarning(airplaneMode);
    if (airplaneModeWarning != null) {
      warnings.add(airplaneModeWarning);
    }

    _currentWarnings.clear();
    _currentWarnings.addAll(warnings);
    _warningsStreamController.sink.add(_currentWarnings);
  }

  void _addListenerToConfigurationMonitoring() {
    _configurationMonitoring.listener.listen(
      (configurationStatus) {
        final warning = _parseConfigurationStatusToWarning(configurationStatus);
        if (warning == null) {
          _currentWarnings.removeWhere((warning) => warning.name == configurationStatus.name);
          _warningsStreamController.sink.add(_currentWarnings);
        } else {
          _currentWarnings.add(warning);
          _warningsStreamController.sink.add(_currentWarnings);
        }
      },
    );
  }

  Warning? _parseConfigurationStatusToWarning(ConfigurationStatus configurationStatus) {
    switch (configurationStatus.name) {
      case IWarningsService.gpsProviderWarningName:
        return !configurationStatus.status
            ? Warning(
                name: configurationStatus.name,
                description:
                    'Your current location settings might impact your background speed tests. Make sure you enable location access in your device settings.',
              )
            : null;
      case IWarningsService.powerModeSaveWarningName:
        return configurationStatus.status
            ? Warning(
                name: configurationStatus.name,
                description:
                    'Your current battery settings might impact your background speed tests. Make sure to disable any battery saver settings.',
              )
            : null;
      case IWarningsService.airplaneModeWarningName:
        return configurationStatus.status
            ? Warning(
                name: configurationStatus.name,
                description:
                    'Background speed tests will not run while your device is in airplane mode. Make sure you disable it in your device settings.',
              )
            : null;
      default:
        return Warning(
          name: configurationStatus.name,
          description: '',
        );
    }
  }

  @override
  Stream<List<Warning>> get warnings => _warningsStreamController.stream.asBroadcastStream();
}
