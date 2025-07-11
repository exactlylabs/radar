import 'dart:async';

import 'package:get_it/get_it.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:endless_service/endless_service.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:endless_service/models/endless_service_options.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/background_fetch/background_speed_test.dart';
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
  EndlessService.setListener(BackgroundFetchListener(), "background_mode");
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

class BackgroundFetchHandler {
  static Future<bool> setupAndStart(int frequency) async {
    try {
      EndlessService.setup(
        callback: callback,
        options: EndlessServiceOptions(name: "background_mode", frequency: frequency * 60000),
        androidNotificationOptions: AndroidNotificationOptions(
          id: 500,
          title: 'Background mode enabled',
          content: 'Speed tests will run in the background.',
          channelId: 'background_mode',
          channelName: 'Background mode',
          channelDescription:
              'This notification will be shown while the background mode is enabled.',
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
      return await EndlessService.stop("background_mode");
    } catch (exception, stackTrace) {
      Sentry.captureException(exception, stackTrace: stackTrace);
      return false;
    }
  }
}

class BackgroundFetchListener implements Listener {
  BackgroundFetchListener() {
    GetIt.I<LocalStorage>().setLocalStorage();
    _restClient = GetIt.I<RestClient>();
    _localStorage = GetIt.I<LocalStorage>();
    _httpProvider = GetIt.I<IHttpProvider>();
    _networkConnectionInfo = GetIt.I<NetworkConnectionInfo>();
    _configurationMonitoring = GetIt.I<ConfigurationMonitoring>();
    _backgroundSpeedTest = BackgroundSpeedTest(
      restClient: _restClient,
      localStorage: _localStorage,
      httpProvider: _httpProvider,
      networkConnectionInfo: _networkConnectionInfo,
      configurationMonitoring: _configurationMonitoring,
    );
  }

  late final RestClient _restClient;
  late final LocalStorage _localStorage;
  late final IHttpProvider _httpProvider;
  late final NetworkConnectionInfo _networkConnectionInfo;
  late final ConfigurationMonitoring _configurationMonitoring;
  late final BackgroundSpeedTest _backgroundSpeedTest;

  @override
  void onStart() {
    _backgroundSpeedTest.setupLocationSettings();
  }

  @override
  void onStop() {
    _backgroundSpeedTest.stopSpeedTest();
  }

  @override
  void onAction() async {
    await _backgroundSpeedTest.startSpeedTest();
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
