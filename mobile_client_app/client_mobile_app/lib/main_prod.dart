import 'dart:async';

import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:client_mobile_app/core/utils/utils.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_prod.dart';

Future<void> main() async {
  final prodStringResources = StringResourceProd();
  mainCommon(prodStringResources.SERVER_ENDPOINT);

  final prodConfig = AppConfig(
    appName: prodStringResources.APP_NAME,
    stringResource: prodStringResources,
    child: const App(),
  );

  await Utils.runWithCrashReporting(prodConfig, prodStringResources);
}
