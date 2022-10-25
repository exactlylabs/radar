import 'dart:async';

import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_prod.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  final prodStringResources = StringResourceProd();
  mainCommon(Uri.parse(prodStringResources.SERVER_ENDPOINT));

  final prodConfig = AppConfig(
    appName: prodStringResources.APP_NAME,
    stringResource: prodStringResources,
    child: const App(),
  );

  await runWithCrashReporting(
    codeToExecute: () => runApp(prodConfig),
    appNamePrefix: prodStringResources.APP_NAME_PREFIX,
    dsn: prodStringResources.SENTRY_FLUTTER_KEY,
  );
}

Future<void> runWithCrashReporting({
  required VoidCallback codeToExecute,
  required String appNamePrefix,
  String? dsn,
}) async {
  // Run the code to execute in a zone and handle all errors within.
  runZonedGuarded(codeToExecute, (error, trace) {});
}
