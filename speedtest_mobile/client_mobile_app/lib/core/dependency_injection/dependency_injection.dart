import 'package:get_it/get_it.dart';
import 'package:ndt7_client/ndt7_client.dart';
import 'package:network_connection_info/network_connection_info.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/background_fetch/app_state_handler.dart';
import 'package:client_mobile_app/core/http_provider/implementation/dio_http_provider.dart';

final sl = GetIt.instance;

void registerDependencies(String baseUrl) {
  sl.registerLazySingleton<LocalStorage>(() => LocalStorage());

  sl.registerLazySingleton<IHttpProvider>(() => DioHttpProvider());

  sl.registerLazySingleton<RestClient>(() => RestClient(baseUrl: baseUrl));

  sl.registerLazySingleton<Ndt7Client>(() => Ndt7Client());

  sl.registerLazySingleton<NetworkConnectionInfo>(() => NetworkConnectionInfo());

  sl.registerLazySingleton<AppStateHandler>(() => AppStateHandler());
}
