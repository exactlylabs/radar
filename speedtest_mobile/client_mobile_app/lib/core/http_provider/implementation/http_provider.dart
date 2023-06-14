import 'dart:io';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/http_provider/models/http_response_model.dart';
import 'package:client_mobile_app/core/http_provider/failures/http_provider_failure.dart';

class HttpProvider implements IHttpProvider {
  @override
  Future<({HttpProviderFailure? failure , T? response})> getAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    final ({HttpProviderFailure? failure, HttpResponseModel? httpResponse}) response = await _get(headers: headers, url: Uri.parse(url));

    if(response.failure != null) {
      return (failure: response.failure, response: null);
    }
    return _decodeResponse<T>(response.httpResponse!, fromJson);
  }

  @override
  Future<({HttpProviderFailure? failure , T? response})> postAndDecode<T>({
    required String url,
    required Map<String, String> headers,
    required dynamic body,
    T Function(Map<String, dynamic> json)? fromJson,
  }) async {
    final ({HttpProviderFailure? failure, HttpResponseModel? httpResponse}) response = await _post(url: Uri.parse(url), headers: headers, body: body);
    if(response.failure != null) {
      return (failure: response.failure, response: null);
    }
    return _decodeResponse<T>(response.httpResponse!, fromJson);      
  }

  Future<({HttpProviderFailure? failure , HttpResponseModel? httpResponse})> _get({
    required Uri url,
    required Map<String, String> headers,
  }) async =>
      _httpCall(() => http.get(url, headers: headers));

  Future<({HttpProviderFailure? failure , HttpResponseModel? httpResponse})> _post({
    required Uri url,
    required Map<String, String> headers,
    required dynamic body,
  }) async =>
      _httpCall(() => http.post(url, headers: headers, body: body));

  Future<({HttpProviderFailure? failure , HttpResponseModel? httpResponse})> _httpCall(Future<http.Response> Function() call) async {
    try {
      final response = await call();
      final decodedBody = response.body;
      final responseModel = HttpResponseModel(statusCode: response.statusCode, body: decodedBody);
      return (failure: null, httpResponse: responseModel);
    } on HttpException catch (error, stackTrace) {
      final failure = HttpProviderFailure(
        exception: error.message,
        stackTrace: stackTrace,
      );
      return (failure: failure, httpResponse: null);
    }
  }

  ({HttpProviderFailure? failure , T? response}) _decodeResponse<T>(
      HttpResponseModel response, T Function(Map<String, dynamic> json)? fromJson) {
    try {
      T t = fromJson != null
          ? fromJson(json.decode(response.body))
          : response.body.isNotEmpty
              ? json.decode(response.body)
              : response.body as T;
      return (failure: null, response: t);
    } catch (exception, stackTrace) {
      final failure = HttpProviderFailure(
        exception: exception,
        stackTrace: stackTrace,
      );
      return (failure: failure, response: null);
    }
  }
}
