import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/services/results_service/i_results_service.dart';
import 'package:client_mobile_app/presentations/your_results/bloc/your_results_state.dart';

class YourResultsCubit extends Cubit<YourResultsState> {
  YourResultsCubit({
    required IResultsService resultsService,
  })  : _resultsService = resultsService,
        super(const YourResultsState()) {
    _loadResults();
  }

  final IResultsService _resultsService;

  void _loadResults() {
    final results = _resultsService.getResults();
    emit(state.copyWith(results: results));
  }
}
