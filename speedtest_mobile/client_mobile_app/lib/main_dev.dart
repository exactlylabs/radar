import 'package:get_it/get_it.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:client_mobile_app/app.dart';
import 'package:client_mobile_app/main_common.dart';
import 'package:client_mobile_app/core/utils/utils.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/flavors/string_resource/string_resource_dev.dart';

void main() async {
  final devStringResources = StringResourceDev();
  await mainCommon(devStringResources.SERVER_ENDPOINT);

  final devConfig = AppConfig(
    appName: devStringResources.APP_NAME,
    stringResource: devStringResources,
    child: App(
      restClient: GetIt.I<RestClient>(),
      localStorage: GetIt.I<LocalStorage>(),
      httpProvider: GetIt.I<IHttpProvider>(),
      networkConnectionInfo: GetIt.I<NetworkConnectionInfo>(),
      configurationMonitoring: GetIt.I<ConfigurationMonitoring>(),
    ),
  );

  Utils.run(devConfig);
}
