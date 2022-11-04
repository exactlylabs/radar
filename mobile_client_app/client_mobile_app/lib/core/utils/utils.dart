import 'dart:async';

import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';
import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

class Utils {
  static Future<HydratedStorage> buildStorage() async {
    WidgetsFlutterBinding.ensureInitialized();
    final storage = await HydratedStorage.build(storageDirectory: await getTemporaryDirectory());
    return storage;
  }

  static Future<void> runWithCrashReporting(AppConfig stgConfig, IStringResource stgStringResources) async {
    HydratedBlocOverrides.runZoned(
      () async {
        _runWithCrashReporting(
          codeToExecute: () => runApp(stgConfig),
          appNamePrefix: stgStringResources.APP_NAME_PREFIX,
          dsn: stgStringResources.SENTRY_FLUTTER_KEY,
        );
      },
      storage: await Utils.buildStorage(),
    );
  }

  static Future<void> run(AppConfig devConfig) async {
    HydratedBlocOverrides.runZoned(
      () => runApp(devConfig),
      storage: await Utils.buildStorage(),
    );
  }

  static void _runWithCrashReporting({
    required VoidCallback codeToExecute,
    required String appNamePrefix,
    String? dsn,
  }) {
    // Run the code to execute in a zone and handle all errors within.
    runZonedGuarded(
      codeToExecute,
      (error, trace) {},
    );
  }
}
