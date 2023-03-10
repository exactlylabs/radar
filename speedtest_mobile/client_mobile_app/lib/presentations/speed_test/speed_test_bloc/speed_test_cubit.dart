import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:network_connection_info/models/connection_info.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/models/test_result.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/services/results_service/i_results_service.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';

class SpeedTestCubit extends Cubit<SpeedTestState> {
  SpeedTestCubit({
    required IResultsService resultsService,
    required LocalStorage localStorage,
  })  : _resultsService = resultsService,
        _localStorage = localStorage,
        super(const SpeedTestState()) {
    _listenConnectivityState();
    _setVersionAndBuildNumber();
    _getTerms();
  }

  final IResultsService _resultsService;
  final LocalStorage _localStorage;

  bool isStepValid(int step) {
    switch (step) {
      case NETWORK_LOCATION_STEP:
        return state.networkLocation != null;
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

  void setNetworkLocation(String networkLocation) {
    emit(state.copyWith(networkLocation: networkLocation));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void _setNetworkType(String networkType) {
    emit(state.copyWith(networkType: networkType));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void setMonthlyBillCost(int monthlyBillCost) {
    emit(state.copyWith(monthlyBillCost: monthlyBillCost));
    emit(state.copyWith(isStepValid: isStepValid(state.step)));
  }

  void resetForm() => emit(const SpeedTestState());

  void preferNotToAnswer() {
    if (state.step == NETWORK_LOCATION_STEP) {
      emit(state.resetSpecificStep(true, false, false));
    } else if (state.step == MONTHLY_BILL_COST_STEP) {
      emit(state.resetSpecificStep(false, false, true));
    }
    emit(state.copyWith(step: state.step + 1));
  }

  void saveResults(double downloadSpeed, double uploadSpeed, double latency, double loss, String? networkQuality,
      ConnectionInfo? connectionInfo, List<Map<String, dynamic>> responses) {
    final result = TestResult(
      download: downloadSpeed,
      upload: uploadSpeed,
      latency: latency,
      loss: loss,
      latitude: state.location?.lat ?? 0.0,
      longitude: state.location?.long ?? 0.0,
      address: state.location?.address ?? Strings.emptyString,
      city: state.location?.city ?? Strings.emptyString,
      state: state.location?.state ?? Strings.emptyString,
      street: state.location?.street ?? Strings.emptyString,
      houseNumber: state.location?.houseNumber ?? Strings.emptyString,
      postalCode: state.location?.postalCode ?? Strings.emptyString,
      testedAt: DateTime.now(),
      networkType: state.networkType ?? Strings.emptyString,
      networkLocation: state.networkLocation ?? Strings.emptyString,
      networkCost: state.monthlyBillCost?.toString() ?? Strings.emptyString,
      networkQuality: networkQuality,
      versionNumber: state.versionNumber ?? Strings.emptyString,
      buildNumber: state.buildNumber ?? Strings.emptyString,
    );

    _resultsService.addResult(responses, result, connectionInfo);
  }

  void setOnContinueAndOnGoBackPressed(VoidCallback? onContinue, [VoidCallback? onBack]) {
    VoidCallback? onContinueCallback;
    VoidCallback? onBackCallback;

    if (onContinue != null && state.onContinue == null && (state.isStepValid || state.step == LOCATION_STEP)) {
      onContinueCallback = onContinue;
    }

    if (onBack != null && state.onBack == null) {
      onBackCallback = onBack;
    }

    if (onContinueCallback == null && onBackCallback == null) return;
    emit(state.copyWith(onContinue: onContinueCallback, onBack: onBackCallback));
  }

  void endForm() {
    emit(state.copyWith(isFormEnded: true));
  }

  void _setVersionAndBuildNumber() {
    PackageInfo.fromPlatform().then((packageInfo) {
      emit(state.copyWith(versionNumber: packageInfo.version, buildNumber: packageInfo.buildNumber));
    });
  }

  Future<void> _getTerms() async {
    if (!_localStorage.isLocalStorageOpen()) {
      await _localStorage.openLocalStorage();
    }
    final termsAccepted = _localStorage.getTerms();
    emit(state.copyWith(termsAccepted: termsAccepted));
  }

  void acceptTerms() {
    _localStorage.setTerms();
    emit(state.resetCallbacks().copyWith(termsAccepted: true));
  }

  Future<void> _listenConnectivityState() async {
    Connectivity().onConnectivityChanged.listen(
      (connectivity) {
        if (connectivity == ConnectivityResult.wifi) {
          _setNetworkType(Strings.wifiConnectionType);
        } else if (connectivity == ConnectivityResult.mobile) {
          _setNetworkType(Strings.cellularConnectionType);
        } else if (connectivity == ConnectivityResult.ethernet) {
          _setNetworkType(Strings.wiredConnectionType);
        } else {
          emit(state.resetSpecificStep(false, true, false));
        }
      },
    );
  }

  static const LOCATION_STEP = 0;
  static const NETWORK_LOCATION_STEP = 1;
  static const MONTHLY_BILL_COST_STEP = 2;
  static const TAKE_SPEED_TEST_STEP = 3;
}
