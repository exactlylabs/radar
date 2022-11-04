import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:client_mobile_app/core/utils/utils.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_dev.dart';

Future<void> main() async {
  final devStringResources = StringResourceDev();
  mainCommon(devStringResources.SERVER_ENDPOINT);

  final devConfig = AppConfig(
    appName: devStringResources.APP_NAME,
    stringResource: devStringResources,
    child: const App(),
  );

  await Utils.run(devConfig);
}
