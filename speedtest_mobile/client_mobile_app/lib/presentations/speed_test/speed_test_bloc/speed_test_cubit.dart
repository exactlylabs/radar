import 'dart:async';

import 'package:client_mobile_app/core/models/warning.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';
import 'package:geolocator/geolocator.dart';
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
    required Connectivity connectivity,
    required IWarningsService warningsService,
  })  : _resultsService = resultsService,
        _localStorage = localStorage,
        _connectivity = connectivity,
        _warningsService = warningsService,
        super(const SpeedTestState()) {
    _listenConnectivityState();
    _listenWarnings();
    _setVersionAndBuildNumber();
    _getTerms();
    _loadWarnings();
  }

  final IResultsService _resultsService;
  final Connectivity _connectivity;
  final LocalStorage _localStorage;
  final IWarningsService _warningsService;

  late StreamSubscription<List<Warning>> _warningsSubscription;

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

  void resetForm() {
    emit(SpeedTestState(networkType: state.networkType, isLoadingTerms: state.isLoadingTerms));
  }

  void preferNotToAnswer() {
    if (state.step == NETWORK_LOCATION_STEP) {
      emit(state.resetSpecificStep(true, false, false));
    } else if (state.step == MONTHLY_BILL_COST_STEP) {
      emit(state.resetSpecificStep(false, false, true));
    }
    emit(state.copyWith(step: state.step + 1));
  }

  void saveResults(
      double downloadSpeed,
      double uploadSpeed,
      double latency,
      double loss,
      String? networkQuality,
      ConnectionInfo? connectionInfo,
      List<Map<String, dynamic>> responses,
      Position? positionBefore,
      Position? positionAfter) {
    Location? locationBefore;
    Location? locationAfter;

    if (positionBefore != null) {
      locationBefore = Location.fromPosition(positionBefore);
    }

    if (positionAfter != null) {
      locationAfter = Location.fromPosition(positionAfter);
    }

    final result = TestResult(
      download: downloadSpeed,
      upload: uploadSpeed,
      latency: latency,
      loss: loss,
      location: state.location!,
      locationBefore: locationBefore,
      locationAfter: locationAfter,
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

  void endForm() {
    emit(state.copyWith(isFormEnded: true));
  }

  void _setVersionAndBuildNumber() {
    PackageInfo.fromPlatform().then((packageInfo) {
      emit(
          state.copyWith(versionNumber: packageInfo.version, buildNumber: packageInfo.buildNumber));
    });
  }

  Future<void> _getTerms() async {
    final termsAccepted = _localStorage.getTerms();
    emit(state.copyWith(termsAccepted: termsAccepted, isLoadingTerms: false));
  }

  void acceptTerms() {
    _localStorage.setTerms();
    emit(state.copyWith(termsAccepted: true));
  }

  Future<void> _listenConnectivityState() async {
    _connectivity.onConnectivityChanged.listen(
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

  Future<void> _loadWarnings() async => await _warningsService.getWarnings();

  void _listenWarnings() {
    _warningsSubscription = _warningsService.warnings.listen((warnings) {
      emit(state.copyWith(hasWarnings: warnings.isNotEmpty));
    });
  }

  @override
  Future<void> close() {
    _warningsSubscription.cancel();
    return super.close();
  }

  static const LOCATION_STEP = 0;
  static const NETWORK_LOCATION_STEP = 1;
  static const MONTHLY_BILL_COST_STEP = 2;
  static const TAKE_SPEED_TEST_STEP = 3;
}
