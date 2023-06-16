import 'package:get_it/get_it.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:configuration_monitoring/configuration_monitoring.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/local_storage/sqlite_local_storage.dart';
import 'package:client_mobile_app/core/background_fetch/app_state_handler.dart';
import 'package:client_mobile_app/core/http_provider/implementation/dio_http_provider.dart';

final sl = GetIt.instance;

void registerDependencies(String baseUrl) {
  if (!sl.isRegistered<LocalStorage>()) {
    sl.registerLazySingleton<LocalStorage>(() => LocalStorage());
  }
  if (!sl.isRegistered<SQLiteLocalStorage>()) {
    sl.registerLazySingleton<SQLiteLocalStorage>(() => SQLiteLocalStorage());
  }
  if (!sl.isRegistered<IHttpProvider>()) {
    sl.registerLazySingleton<IHttpProvider>(() => DioHttpProvider());
  }

  if (!sl.isRegistered<RestClient>()) {
    sl.registerLazySingleton<RestClient>(() => RestClient(baseUrl: baseUrl));
  }

  if (!sl.isRegistered<NetworkConnectionInfo>()) {
    sl.registerLazySingleton<NetworkConnectionInfo>(() => NetworkConnectionInfo());
  }

  if (!sl.isRegistered<AppStateHandler>()) {
    sl.registerLazySingleton<AppStateHandler>(() => AppStateHandler());
  }

  if (!sl.isRegistered<ConfigurationMonitoring>()) {
    sl.registerLazySingleton<ConfigurationMonitoring>(() => ConfigurationMonitoring());
  }
}
