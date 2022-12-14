import 'dart:async';

import 'package:flutter/material.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class Utils {
  static Future<void> runWithCrashReporting(AppConfig config, IStringResource stringResources) async {
    _runWithCrashReporting(
      codeToExecute: () => runApp(config),
      appNamePrefix: stringResources.APP_NAME_PREFIX,
      dsn: stringResources.SENTRY_FLUTTER_KEY,
    );
  }

  static void run(AppConfig config) => runApp(config);

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
