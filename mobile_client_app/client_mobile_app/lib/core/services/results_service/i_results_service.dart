import 'package:client_mobile_app/core/models/test_result.dart';
import 'package:network_connection_info/models/connection_info.dart';

abstract class IResultsService {
  List<TestResult> getResults();

  void addResult(List<Map<String, dynamic>> responses, TestResult result, ConnectionInfo? connectionInfo);
}
