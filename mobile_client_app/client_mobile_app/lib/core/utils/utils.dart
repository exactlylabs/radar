import 'dart:async';

import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class Utils {
  static Future<void> runWithCrashReporting(AppConfig config, IStringResource stringResources) async {
    HydratedBlocOverrides.runZoned(
      () async {
        _runWithCrashReporting(
          codeToExecute: () => runApp(config),
          appNamePrefix: stringResources.APP_NAME_PREFIX,
          dsn: stringResources.SENTRY_FLUTTER_KEY,
        );
      },
      storage: await _buildStorage(),
    );
  }

  static Future<void> run(AppConfig config) async {
    HydratedBlocOverrides.runZoned(
      () => runApp(config),
      storage: await _buildStorage(),
    );
  }

  static Future<HydratedStorage> _buildStorage() async {
    WidgetsFlutterBinding.ensureInitialized();
    final storage = await HydratedStorage.build(storageDirectory: await getTemporaryDirectory());
    return storage;
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
