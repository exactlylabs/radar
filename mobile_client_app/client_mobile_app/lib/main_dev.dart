import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_dev.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

Future<void> main() async {
  final devStringResources = StringResourceDev();
  mainCommon(devStringResources.SERVER_ENDPOINT);

  final devConfig = AppConfig(
    appName: devStringResources.APP_NAME,
    stringResource: devStringResources,
    child: const App(),
  );

  HydratedBlocOverrides.runZoned(
    () async {
      runApp(devConfig);
    },
    storage: await _buildStorage(),
  );
}

Future<HydratedStorage> _buildStorage() async {
  WidgetsFlutterBinding.ensureInitialized();
  final storage = await HydratedStorage.build(storageDirectory: await getTemporaryDirectory());
  return storage;
}
