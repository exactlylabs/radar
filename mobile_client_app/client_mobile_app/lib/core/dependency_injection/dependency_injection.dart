import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/http_provider/implementation/http_provider.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:get_it/get_it.dart';

final sl = GetIt.instance;

void registerDependencies(String baseUrl) {
  sl.registerLazySingleton<LocalStorage>(() => LocalStorage());

  sl.registerLazySingleton<IHttpProvider>(() => HttpProvider());

  sl.registerLazySingleton<RestClient>(() => RestClient(baseUrl: baseUrl));
}
