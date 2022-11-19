import 'package:client_mobile_app/core/services/results_service/i_results_service.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/models/test_result.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';

class SpeedTestCubit extends HydratedCubit<SpeedTestState> {
  SpeedTestCubit({
    required IResultsService resultsService,
  })  : _resultsService = resultsService,
        super(const SpeedTestState());

  final IResultsService _resultsService;

  bool isStepValid(int step) {
    switch (step) {
      case NETWORK_LOCATION_STEP:
        return state.networkLocation != null;
      case NETWORK_TYPE_STEP:
        return state.networkType != null;
      case MONTHLY_BILL_COST_STEP:
        return state.monthlyBillCost != null;
      default:
        return true;
    }
  }

  void nextStep() {
    if (state.isStepValid) {
      emit(state.copyWith(step: state.step + 1, isStepValid: isStepValid(state.step + 1)));
    }
  }

  void previousStep() {
    emit(state.copyWith(step: state.step - 1, isStepValid: isStepValid(state.step - 1)));
  }

  void setLocation(Location location) {
    emit(state.copyWith(location: location));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void setTermsAccepted(bool termsAccepted) {
    emit(state.copyWith(termsAccepted: termsAccepted));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void setNetworkLocation(String networkLocation) {
    emit(state.copyWith(networkLocation: networkLocation));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void setNetworkType(String networkType) {
    emit(state.copyWith(networkType: networkType));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void setMonthlyBillCost(int monthlyBillCost) {
    emit(state.copyWith(monthlyBillCost: monthlyBillCost));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void resetForm() => emit(const SpeedTestState());

  void saveResults(
      double downloadSpeed, double uploadSpeed, double latency, double loss, List<Map<String, dynamic>> responses) {
    final result = TestResult(
      dateTime: DateTime.now(),
      download: downloadSpeed,
      upload: uploadSpeed,
      loss: loss,
      latency: latency,
      address: state.location?.address ?? Strings.emptyString,
      networkType: state.networkType ?? Strings.emptyString,
      networkLocation: state.networkLocation ?? Strings.emptyString,
      networkQuality: Strings.emptyString,
    );

    _resultsService.addResult(responses, result);
  }

  @override
  SpeedTestState? fromJson(Map<String, dynamic> json) {
    return SpeedTestState.fromJson(json);
  }

  @override
  Map<String, dynamic>? toJson(SpeedTestState state) {
    return state.toJson();
  }

  static const LOCATION_STEP = 0;
  static const NETWORK_LOCATION_STEP = 1;
  static const NETWORK_TYPE_STEP = 2;
  static const MONTHLY_BILL_COST_STEP = 3;
  static const TAKE_SPEED_TEST_STEP = 4;

  void endForm() {
    emit(state.copyWith(isFormEnded: true));
  }
}
