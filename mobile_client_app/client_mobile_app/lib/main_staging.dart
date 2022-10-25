import 'dart:async';

import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resources_stg.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  final stgStringResources = StringResourceStg();
  mainCommon(Uri.parse(stgStringResources.SERVER_ENDPOINT));

  final stgConfig = AppConfig(
    appName: stgStringResources.APP_NAME,
    stringResource: stgStringResources,
    child: const App(),
  );

  await runWithCrashReporting(
    codeToExecute: () => runApp(stgConfig),
    appNamePrefix: stgStringResources.APP_NAME_PREFIX,
    dsn: stgStringResources.SENTRY_FLUTTER_KEY,
  );
}

Future<void> runWithCrashReporting({
  required VoidCallback codeToExecute,
  required String appNamePrefix,
  String? dsn,
}) async {
  // Run the code to execute in a zone and handle all errors within.
  runZonedGuarded(
    codeToExecute,
    (error, trace) async {},
  );
}
