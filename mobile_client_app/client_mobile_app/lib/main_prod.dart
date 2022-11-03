import 'dart:async';

import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_prod.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

Future<void> main() async {
  final prodStringResources = StringResourceProd();
  mainCommon(prodStringResources.SERVER_ENDPOINT);

  final prodConfig = AppConfig(
    appName: prodStringResources.APP_NAME,
    stringResource: prodStringResources,
    child: const App(),
  );

  HydratedBlocOverrides.runZoned(
    () async {
      runWithCrashReporting(
        codeToExecute: () => runApp(prodConfig),
        appNamePrefix: prodStringResources.APP_NAME_PREFIX,
        dsn: prodStringResources.SENTRY_FLUTTER_KEY,
      );
    },
    storage: await _buildStorage(),
  );
}

void runWithCrashReporting({
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

Future<HydratedStorage> _buildStorage() async {
  WidgetsFlutterBinding.ensureInitialized();
  final storage = await HydratedStorage.build(storageDirectory: await getTemporaryDirectory());
  return storage;
}
