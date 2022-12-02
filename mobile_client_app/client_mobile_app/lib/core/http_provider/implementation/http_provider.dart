import 'dart:convert';

import 'package:client_mobile_app/core/http_provider/failures/http_provider_failure.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/http_provider/models/http_response_model.dart';
import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

class HttpProvider implements IHttpProvider {
  @override
  Future<Either<HttpProviderFailure, T>> getAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    final failureOrResponse = await _get(headers: headers, url: url);
    return failureOrResponse.fold(
      (failure) => Left(failure),
      (response) => _decodeResponse<T>(response, fromJson),
    );
  }

  @override
  Future<Either<HttpProviderFailure, T>> postAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    required Map<String, dynamic> body,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    final failureOrResponse = await _post(url: url, headers: headers, body: body);
    return failureOrResponse.fold(
      (failure) => Left(failure),
      (response) => _decodeResponse<T>(response, fromJson),
    );
  }

  Future<Either<HttpProviderFailure, HttpResponseModel>> _get({
    required String url,
    required Map<String, String> headers,
  }) async =>
      _dioCall(() => Dio().get(url, options: Options(headers: headers, responseType: ResponseType.plain)));

  Future<Either<HttpProviderFailure, HttpResponseModel>> _post({
    required String url,
    required Map<String, String> headers,
    required Map<String, dynamic> body,
  }) async =>
      _dioCall(() => Dio().post(url,
          options: Options(headers: headers, responseType: ResponseType.plain), data: FormData.fromMap(body)));

  Future<Either<HttpProviderFailure, HttpResponseModel>> _dioCall(Future<Response> Function() call) async {
    try {
      final response = await call();
      final decodedBody = response.data as String;
      return Right(HttpResponseModel(statusCode: response.statusCode, body: decodedBody));
    } on DioError catch (dioError, stackTrace) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx and is also not 304.
      return Left(HttpProviderFailure(
        exception: dioError.error,
        stackTrace: stackTrace,
      ));
    }
  }

  Either<HttpProviderFailure, T> _decodeResponse<T>(
      HttpResponseModel response, T Function(Map<String, dynamic> json)? fromJson) {
    try {
      T t = fromJson != null ? fromJson(json.decode(response.body)) : json.decode(response.body) as T;
      return Right(t);
    } catch (exception, stackTrace) {
      return Left(HttpProviderFailure(
        exception: exception,
        stackTrace: stackTrace,
      ));
    }
  }
}
