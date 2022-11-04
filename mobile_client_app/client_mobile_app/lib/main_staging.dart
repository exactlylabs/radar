import 'dart:async';

import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:client_mobile_app/core/utils/utils.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resources_stg.dart';

Future<void> main() async {
  final stgStringResources = StringResourceStg();
  mainCommon(stgStringResources.SERVER_ENDPOINT);

  final stgConfig = AppConfig(
    appName: stgStringResources.APP_NAME,
    stringResource: stgStringResources,
    child: const App(),
  );

  await Utils.runWithCrashReporting(stgConfig, stgStringResources);
}
