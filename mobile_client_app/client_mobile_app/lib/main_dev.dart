import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_dev.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:flutter/material.dart';

void main() {
  final devStringResources = StringResourceDev();
  mainCommon(Uri.parse(devStringResources.SERVER_ENDPOINT));

  final devConfig = AppConfig(
    appName: devStringResources.APP_NAME,
    stringResource: devStringResources,
    child: const App(),
  );

  runApp(devConfig);
}
