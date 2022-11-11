import 'package:client_mobile_app/core/models/test_result.dart';

class YourResultsState {
  const YourResultsState({
    this.results,
  });

  YourResultsState copyWith({
    List<TestResult>? results,
  }) {
    return YourResultsState(
      results: results ?? this.results,
    );
  }

  final List<TestResult>? results;
}
