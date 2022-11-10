import 'package:client_mobile_app/core/models/location.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';

class SpeedTestCubit extends HydratedCubit<SpeedTestState> {
  SpeedTestCubit() : super(const SpeedTestState());

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

  void resetForm() {
    emit(const SpeedTestState());
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
}
