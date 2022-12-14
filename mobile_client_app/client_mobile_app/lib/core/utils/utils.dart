import 'dart:async';

import 'package:flutter/material.dart';
import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/i_string_resource.dart';

class Utils {
  static Future<void> runWithCrashReporting(AppConfig config, IStringResource stringResources) async {
    _runWithCrashReporting(
      codeToExecute: () => runApp(config),
      appNamePrefix: stringResources.APP_NAME_PREFIX,
      dsn: stringResources.SENTRY_FLUTTER_KEY,
      environment: stringResources.ENVIRONMENT,
    );
  }

  static void run(AppConfig config) => runApp(config);

  static Future<void> _runWithCrashReporting({
    required VoidCallback codeToExecute,
    required String appNamePrefix,
    required String environment,
    String? dsn,
  }) async {
    await SentryFlutter.init(
      (options) {
        options.dsn = dsn;
        options.addInAppInclude(appNamePrefix);
        options.environment = environment;
      },
    );

    // Hook into Flutter error handling.
    FlutterError.onError =
        (details) async => await Sentry.captureException(details.exception, stackTrace: details.stack);

    // Run the code to execute in a zone and handle all errors within.
    runZonedGuarded(
      codeToExecute,
      (error, trace) async {
        await Sentry.captureException(error, stackTrace: trace);
      },
    );
  }
}
