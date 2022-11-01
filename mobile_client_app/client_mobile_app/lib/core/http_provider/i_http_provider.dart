import 'package:client_mobile_app/core/http_provider/failures/http_provider_failure.dart';
import 'package:dartz/dartz.dart';

abstract class IHttpProvider {
  Future<Either<HttpProviderFailure, T>> getAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    T Function(Map<String, dynamic> json)? fromJson,
  });

  Future<Either<HttpProviderFailure, T>> postAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    required Map<String, dynamic> body,
    T Function(Map<String, dynamic> json)? fromJson,
  });
}
