import 'package:client_mobile_app/core/models/location.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';

class SpeedTestCubit extends HydratedCubit<SpeedTestState> {
  SpeedTestCubit() : super(const SpeedTestState());

  bool isStepValid(int step) {
    switch (step) {
      case _NETWORK_LOCATION_STEP:
        return state.networkLocation != null;
      case _NETWORK_TYPE_STEP:
        return state.networkType != null;
      case _MONTHLY_BILL_COST_STEP:
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
    emit(state.copyWith(location: location, isStepValid: isStepValid(state.step)));
  }

  void setTermsAccepted(bool termsAccepted) {
    emit(state.copyWith(termsAccepted: termsAccepted, isStepValid: isStepValid(state.step)));
  }

  void setNetworkLocation(String networkLocation) {
    emit(state.copyWith(networkLocation: networkLocation, isStepValid: isStepValid(state.step)));
  }

  void setNetworkType(String networkType) {
    emit(state.copyWith(networkType: networkType, isStepValid: isStepValid(state.step)));
  }

  void setMonthlyBillCost(int monthlyBillCost) {
    emit(state.copyWith(monthlyBillCost: monthlyBillCost, isStepValid: isStepValid(state.step)));
  }

  void startSpeedTest() {
    emit(state.copyWith(isTestRunning: true));
  }

  void stopSpeedTest() {
    emit(state.copyWith(isTestRunning: false));
  }

  @override
  SpeedTestState? fromJson(Map<String, dynamic> json) {
    return SpeedTestState.fromJson(json);
  }

  @override
  Map<String, dynamic>? toJson(SpeedTestState state) {
    return state.toJson();
  }

  static const _NETWORK_LOCATION_STEP = 1;
  static const _NETWORK_TYPE_STEP = 2;
  static const _MONTHLY_BILL_COST_STEP = 3;
}
