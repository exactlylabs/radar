import 'package:sentry_flutter/sentry_flutter.dart';
import 'package:network_connection_info/models/connection_info.dart';
import 'package:client_mobile_app/core/models/test_result.dart';
import 'package:client_mobile_app/core/rest_client/rest_client.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/http_provider/i_http_provider.dart';
import 'package:client_mobile_app/core/services/results_service/i_results_service.dart';

class ResultsService implements IResultsService {
  const ResultsService({
    required RestClient restClient,
    required LocalStorage localStorage,
    required IHttpProvider httpProvider,
  })  : _restClient = restClient,
        _localStorage = localStorage,
        _httpProvider = httpProvider;

  final RestClient _restClient;
  final IHttpProvider _httpProvider;
  final LocalStorage _localStorage;

  @override
  List<TestResult> getResults() {
    final results = _localStorage.getResults();
    final parsedResults = results.map((result) => TestResult.fromJson(result)).toList();
    return parsedResults;
  }

  @override
  void addResult(List<Map<String, dynamic>> responses, TestResult result, ConnectionInfo? connectionInfo) {
    _localStorage.addResult(result.toJson());
    _httpProvider
        .postAndDecode(
      url: _restClient.speedTest,
      headers: {
        'Content-Type': 'application/json',
        'Origin': _restClient.baseUrl,
      },
      body: _buildBody(responses, result, connectionInfo),
    )
        .then((failureOrSuccess) {
      failureOrSuccess.fold(
        (failure) => Sentry.captureException(failure.exception, stackTrace: failure.stackTrace),
        (_) => _,
      );
    });
  }

  Map<String, dynamic> _buildBody(
      List<Map<String, dynamic>> responses, TestResult result, ConnectionInfo? connectionInfo) {
    return {
      'result': {'raw': responses},
      'speed_test': result.toJsonServer(),
      'connection_data': connectionInfo?.toJson(),
    };
  }
}
