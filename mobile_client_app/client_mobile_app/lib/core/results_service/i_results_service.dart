import 'package:client_mobile_app/core/models/test_result.dart';

abstract class IResultsService {
  List<TestResult> getResults();

  void addResult(List<Map<String, dynamic>> responses, TestResult result);
}
