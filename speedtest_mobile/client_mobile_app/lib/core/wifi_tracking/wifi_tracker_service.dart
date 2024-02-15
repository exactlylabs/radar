import 'dart:async';

import 'package:client_mobile_app/core/wifi_tracking/wifi_tracker.dart';
import 'package:get_it/get_it.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:endless_service/endless_service.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:endless_service/models/endless_service_options.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/web_socket_client/web_socket_client.dart';
import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_dev.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resources_stg.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_prod.dart';
import 'package:client_mobile_app/core/dependency_injection/dependency_injection.dart' as DI;
import 'package:endless_service/models/android_notification_options/notification_priority.dart';
import 'package:endless_service/models/android_notification_options/notification_icon_data.dart';
import 'package:endless_service/models/android_notification_options/android_notification_options.dart';
import 'package:endless_service/models/android_notification_options/notification_channel_importance.dart';

@pragma('vm:entry-point')
void callback() async {
  const flavor = String.fromEnvironment('FLAVOR', defaultValue: 'dev');
  IStringResource stringResource = _loadStringResource(flavor);
  DI.registerDependencies(stringResource.SERVER_ENDPOINT);

  await SentryFlutter.init(
    (options) {
      options.dsn = stringResource.SENTRY_FLUTTER_KEY;
      options.addInAppInclude(stringResource.APP_NAME_PREFIX);
      options.environment = stringResource.ENVIRONMENT;
    },
  );

  await GetIt.I<LocalStorage>().setLocalStorage();
  EndlessService.setListener(WifiTrackerServiceListener());
}

IStringResource _loadStringResource(String flavor) {
  if (flavor == 'dev') {
    return StringResourceDev();
  } else if (flavor == 'staging') {
    return StringResourceStg();
  } else {
    return StringResourceProd();
  }
}

class WifiTrackerService {
  static Future<bool> setupAndStart(int frequency) async {
    try {
      EndlessService.setup(
        callback: callback,
        options: EndlessServiceOptions(frequency: frequency, forceHandler: true, wifiLock: true),
        androidNotificationOptions: AndroidNotificationOptions(
          id: 600,
          title: 'Wifi Tracker enabled',
          content: 'Scanning for wifi networks in the background.',
          channelId: 'wifi_tracker',
          channelName: 'Wifi Tracker',
          channelDescription: 'Scanning for wifi networks in the background.',
          channelImportance: NotificationChannelImportance.HIGH,
          priority: NotificationPriority.HIGH,
          iconData: const NotificationIconData(
            resType: ResourceType.drawable,
            resPrefix: ResourcePrefix.ic,
            name: 'notification',
            backgroundColor: AppColors.deepBlue,
          ),
        ),
      );

      return await EndlessService.start();
    } catch (exception, stackTrace) {
      Sentry.captureException(exception, stackTrace: stackTrace);
      return false;
    }
  }

  static Future<bool> stop() async {
    try {
      return await EndlessService.stop();
    } catch (exception, stackTrace) {
      Sentry.captureException(exception, stackTrace: stackTrace);
      return false;
    }
  }
}

class WifiTrackerServiceListener implements Listener {
  WifiTrackerServiceListener() {
    GetIt.I<LocalStorage>().setLocalStorage();
    _localStorage = GetIt.I<LocalStorage>();
    _networkConnectionInfo = GetIt.I<NetworkConnectionInfo>();
    _configurationMonitoring = GetIt.I<ConfigurationMonitoring>();
    _webSocketClient = GetIt.I<WebSocketClient>();
    _wifiTracker = WifiTracker(
      localStorage: _localStorage,
      webSocketClient: _webSocketClient,
      networkConnectionInfo: _networkConnectionInfo,
    );
  }
  late final LocalStorage _localStorage;
  late final NetworkConnectionInfo _networkConnectionInfo;
  late final ConfigurationMonitoring _configurationMonitoring;
  late final WebSocketClient _webSocketClient;
  late final WifiTracker _wifiTracker;

  @override
  void onStart() {
    _wifiTracker.setupWifiTracking();
  }

  @override
  void onStop() {
    _wifiTracker.stopWifiTracking();
  }

  @override
  void onAction() async {
    await _wifiTracker.startWifiTracking();
  }

  @override
  void onFailure(String error) async {
    final logcatLogs = error;
    final sessionId = _localStorage.getSessionId();
    final deviceAndPermissionsState = await _configurationMonitoring.getDeviceAndPermissionsState();

    Sentry.captureException(
      'Background mode failed. Please check logs. sessionId: $sessionId',
      withScope: (scope) {
        scope.setExtra('logcatLogs', logcatLogs);
        scope.setExtra('deviceAndPermissionsState', deviceAndPermissionsState);
      },
    );
  }
}
