import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/models/test_result.dart';
import 'package:client_mobile_app/presentations/your_results/bloc/your_results_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class YourResultsCubit extends Cubit<YourResultsState> {
  YourResultsCubit({
    required LocalStorage localStorage,
  })  : _localStorage = localStorage,
        super(const YourResultsState()) {
    _loadResults();
  }

  final LocalStorage _localStorage;

  void _loadResults() {
    final results = _localStorage.getResults();
    final parsedResults = results.map((result) => TestResult.fromJson(result)).toList();
    emit(state.copyWith(results: parsedResults));
  }
}
