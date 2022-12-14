import 'dart:async';

import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:get_it/get_it.dart';
import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:client_mobile_app/core/utils/utils.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_prod.dart';
import 'package:ndt7_client/ndt7_client.dart';

Future<void> main() async {
  final prodStringResources = StringResourceProd();
  mainCommon(prodStringResources.SERVER_ENDPOINT);

  final prodConfig = AppConfig(
    appName: prodStringResources.APP_NAME,
    stringResource: prodStringResources,
    child: App(
      restClient: GetIt.I<RestClient>(),
      localStorage: GetIt.I<LocalStorage>(),
      httpProvider: GetIt.I<IHttpProvider>(),
      ndt7client: GetIt.I<Ndt7Client>(),
    ),
  );

  await Utils.runWithCrashReporting(prodConfig, prodStringResources);
}
