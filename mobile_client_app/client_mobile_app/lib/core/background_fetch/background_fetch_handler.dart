import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:background_fetch/background_fetch.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/background_fetch/app_state_handler.dart';
import 'package:client_mobile_app/core/background_fetch/background_speed_test.dart';

class BackgroundFetchHandler {
  @pragma('vm:entry-point')
  static void backgroundFetchHeadlessTask(HeadlessTask task) async {
    String taskId = task.taskId;
    bool isTimeout = task.timeout;
    if (isTimeout) {
      print("[BackgroundFetch] Headless task timed-out: $taskId");
      BackgroundFetch.finish(taskId);
      return;
    }
    if (taskId == _BACKGROUND_SPEED_TEST_ID) {
      final backgroundSpeedTest = BackgroundSpeedTest(
        ndt7client: GetIt.I<Ndt7Client>(),
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
    _registerHeadleesTask();
    _registerBackgroundSpeedTestTask(delay);
  }

  static void stopBackgroundSpeedTest() {
    BackgroundFetch.stop(_BACKGROUND_SPEED_TEST_ID);
  }

  static void _registerHeadleesTask() {
    if (Platform.isAndroid) {
      BackgroundFetch.registerHeadlessTask(backgroundFetchHeadlessTask);
    }
  }

  static Future<void> _setBackgroundFetchPlugin() async {
    final appStateHandler = GetIt.I<AppStateHandler>();
    appStateHandler.initState();
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
      (String taskId) async {
        final appStateHandler = GetIt.I<AppStateHandler>();
        if (taskId == _BACKGROUND_SPEED_TEST_ID && appStateHandler.appState == AppLifecycleState.paused) {
          final backgroundSpeedTest = BackgroundSpeedTest(
            ndt7client: GetIt.I<Ndt7Client>(),
            restClient: GetIt.I<RestClient>(),
            httpProvider: GetIt.I<IHttpProvider>(),
            networkConnectionInfo: GetIt.I<NetworkConnectionInfo>(),
          );
          backgroundSpeedTest.startSpeedTest();
        }
        BackgroundFetch.finish(taskId);
      },
      (String taskId) async {
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
