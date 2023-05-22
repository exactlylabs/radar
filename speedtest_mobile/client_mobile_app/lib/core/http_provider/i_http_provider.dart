import 'package:client_mobile_app/core/http_provider/failures/http_provider_failure.dart';

abstract class IHttpProvider {
  Future<({HttpProviderFailure? failure , T? response})> getAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    T Function(Map<String, dynamic> json)? fromJson,
  });

  Future<({HttpProviderFailure? failure , T? response})> postAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    required dynamic body,
    T Function(Map<String, dynamic> json)? fromJson,
  });
}
