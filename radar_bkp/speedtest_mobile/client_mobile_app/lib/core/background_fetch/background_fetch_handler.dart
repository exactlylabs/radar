import 'dart:async';
import 'dart:io';

import 'package:get_it/get_it.dart';
import 'package:background_fetch/background_fetch.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/background_fetch/background_speed_test.dart';
import 'package:client_mobile_app/core/dependency_injection/dependency_injection.dart' as DI;

class BackgroundFetchHandler {
  @pragma('vm:entry-point')
  static void backgroundFetchHeadlessTask(HeadlessTask task) {
    String taskId = task.taskId;
    bool isTimeout = task.timeout;
    if (isTimeout) {
      print("[BackgroundFetch] Headless task timed-out: $taskId");
      BackgroundFetch.finish(taskId);
      return;
    }
    if (taskId == _BACKGROUND_SPEED_TEST_ID) {
      const url = String.fromEnvironment('BASE_URL', defaultValue: '');
      DI.registerDependencies(url);
      final backgroundSpeedTest = BackgroundSpeedTest(
        restClient: GetIt.I<RestClient>(),
        httpProvider: GetIt.I<IHttpProvider>(),
        networkConnectionInfo: GetIt.I<NetworkConnectionInfo>(),
      );
      backgroundSpeedTest.startSpeedTest();
    }
    BackgroundFetch.finish(taskId);
  }

  static void startBackgroundSpeedTest(int delay) {
    _setBackgroundFetchPlugin();
    _registerHeadlessTask();
    _registerBackgroundSpeedTestTask(delay);
  }

  static void stopBackgroundSpeedTest() {
    BackgroundFetch.stop(_BACKGROUND_SPEED_TEST_ID);
  }

  static void _registerHeadlessTask() {
    if (Platform.isAndroid) {
      BackgroundFetch.registerHeadlessTask(backgroundFetchHeadlessTask);
    }
  }

  static Future<void> _setBackgroundFetchPlugin() async {
    final status = await _initPlatformState();

    if (status == BackgroundFetch.STATUS_RESTRICTED) {
      print("BackgroundFetch restricted");
    } else if (status == BackgroundFetch.STATUS_DENIED) {
      print("BackgroundFetch denied");
    } else if (status == BackgroundFetch.STATUS_AVAILABLE) {
      print("BackgroundFetch available");
    }
  }

  static Future<int> _initPlatformState() async {
    return await BackgroundFetch.configure(
      BackgroundFetchConfig(
        minimumFetchInterval: 15,
        stopOnTerminate: false,
        enableHeadless: true,
        requiresBatteryNotLow: false,
        requiresCharging: false,
        requiresStorageNotLow: false,
        requiresDeviceIdle: false,
        requiredNetworkType: NetworkType.ANY,
      ),
      (String taskId) {
        if (taskId == _BACKGROUND_SPEED_TEST_ID) {
          final backgroundSpeedTest = BackgroundSpeedTest(
            restClient: GetIt.I<RestClient>(),
            httpProvider: GetIt.I<IHttpProvider>(),
            networkConnectionInfo: GetIt.I<NetworkConnectionInfo>(),
          );
          backgroundSpeedTest.startSpeedTest();
        }
        BackgroundFetch.finish(taskId);
      },
      (String taskId) {
        print("[BackgroundFetch] TASK TIMEOUT taskId: $taskId");
        BackgroundFetch.finish(taskId);
      },
    );
  }

  static void _registerBackgroundSpeedTestTask(int delay) {
    BackgroundFetch.scheduleTask(
      TaskConfig(
        taskId: _BACKGROUND_SPEED_TEST_ID,
        delay: delay,
        periodic: true,
        forceAlarmManager: true,
        stopOnTerminate: false,
        enableHeadless: true,
        requiresCharging: false,
        requiresDeviceIdle: false,
        requiresBatteryNotLow: false,
        requiresStorageNotLow: false,
      ),
    );
  }

  static const String _BACKGROUND_SPEED_TEST_ID = "com.transistorsoft.customtask";
}
