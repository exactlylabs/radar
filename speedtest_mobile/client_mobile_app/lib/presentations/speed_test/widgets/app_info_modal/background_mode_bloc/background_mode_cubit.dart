import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:client_mobile_app/core/models/warning.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_state.dart';

class BackgroundModeCubit extends Cubit<BackgroundModeState> {
  BackgroundModeCubit({
    required LocalStorage localStorage,
    required IWarningsService warningsService,
    required Stream<BackgroundFetchState> backgroundFetchStateListener,
    required bool backgroundFetchIsEnabled,
    required int backgroundFetchFrequency,
  })  : _localStorage = localStorage,
        _warningsService = warningsService,
        _backgroundFetchStateListener = backgroundFetchStateListener,
        super(BackgroundModeState(
            backgroundMode: backgroundFetchIsEnabled,
            frequency: backgroundFetchFrequency > 0 ? backgroundFetchFrequency : 10)) {
    if (backgroundFetchIsEnabled) _canEnableBackgroundMode();
    _listenToBackgroundFetchState();
    _listenToWarnings();
    _loadWarnings();
    _checkOptionalPermissions();
  }

  final LocalStorage _localStorage;
  final IWarningsService _warningsService;
  late StreamSubscription<List<Warning>>? _warningsSubscription;
  late StreamSubscription<BackgroundFetchState>? _backgroundFetchStateSubscription;
  final Stream<BackgroundFetchState> _backgroundFetchStateListener;

  Future<void> enableBackgroundMode() async {
    if (!_everAskedForLocationAllTime()) {
      emit(state.copyWith(askForLocationAllTime: true));
    } else {
      bool? hasAccessToPhoneState;
      bool? hasAccessToNotifications;
      List<WarningViewModel>? warnings = state.warnings ?? [];
      final locationAllTimeWarning = WarningViewModel.locationPermissionWarning();
      final hasAccessToLocationAllTime = await _checkAccessToLocationAllTime();
      if (hasAccessToLocationAllTime) {
        warnings.remove(locationAllTimeWarning);
        hasAccessToPhoneState = await _checkAccessToPhoneState();
        hasAccessToNotifications = await _checkAccessToNotifications();
        final phoneStateWarning = WarningViewModel.phoneStatePermissionWarning();
        final notificationsWarning = WarningViewModel.notificationPermissionWarning();
        warnings.remove(phoneStateWarning);
        warnings.remove(notificationsWarning);
        if (!hasAccessToPhoneState) {
          warnings.add(phoneStateWarning);
        }
        if (!hasAccessToNotifications) {
          warnings.add(notificationsWarning);
        }
      } else {
        warnings.add(locationAllTimeWarning);
      }
      final askForOptionalPermissions = hasAccessToLocationAllTime &&
          (!(hasAccessToPhoneState ?? false) || !(hasAccessToNotifications ?? false));

      final askForFrequency =
          hasAccessToLocationAllTime && !askForOptionalPermissions && !state.backgroundMode;

      warnings.sort((a, b) => a.priority.compareTo(b.priority));
      emit(state.copyWith(
        askForLocationAllTime: false,
        warnings: warnings,
        askForFrequency: askForFrequency,
        askForOptionalPermissions: askForOptionalPermissions,
        hasAccessToPhoneState: hasAccessToPhoneState,
        hasAccessToNotifications: hasAccessToNotifications,
        hasAccessToLocationAllTime: hasAccessToLocationAllTime,
      ));
    }
  }

  Future<void> allowAccessToOptionalPermissions() async {
    if (!(state.hasAccessToPhoneState ?? false)) {
      final hasAccessToPhoneState = await _requestAccessToPhoneState();
      List<WarningViewModel>? warnings = List.from(state.warnings ?? []);
      final warning = WarningViewModel.phoneStatePermissionWarning();
      warnings.remove(warning);
      if (!hasAccessToPhoneState) {
        warnings.add(warning);
      }
      warnings.sort((a, b) => a.priority.compareTo(b.priority));
      emit(state.copyWith(
        hasAccessToPhoneState: hasAccessToPhoneState,
        warnings: warnings,
        askForOptionalPermissions: false,
      ));
    }

    if (!(state.hasAccessToNotifications ?? false)) {
      final hasAccessToNotifications = await _requestAccessToNotifications();
      List<WarningViewModel>? warnings = List.from(state.warnings ?? []);
      final warning = WarningViewModel.notificationPermissionWarning();
      warnings.remove(warning);
      if (!hasAccessToNotifications) {
        warnings.add(warning);
      }
      warnings.sort((a, b) => a.priority.compareTo(b.priority));
      emit(state.copyWith(
        hasAccessToNotifications: hasAccessToNotifications,
        warnings: warnings,
        askForOptionalPermissions: false,
      ));
    }
    if ((state.hasAccessToLocationAllTime ?? false) && !state.askForOptionalPermissions) {
      askForBackgroundModeFrequency();
    }
  }

  void askForBackgroundModeFrequency() =>
      emit(state.copyWith(askForFrequency: true, askForOptionalPermissions: false));

  void cancelBackgroundModeFrequency() => emit(state.copyWith(askForFrequency: false));

  void setBackgroundModeFrequency(int frequency) {
    emit(state.copyWith(askForFrequency: false, frequency: frequency));
  }

  Future<void> onAppResumed() async {
    if (!state.backgroundMode && !(state.hasAccessToLocationAllTime ?? false)) {
      enableBackgroundMode();
    }
  }

  Future<void> _listenToBackgroundFetchState() async {
    _backgroundFetchStateSubscription = _backgroundFetchStateListener.listen((bfState) {
      emit(state.copyWith(
        backgroundMode: bfState.isEnabled,
        frequency: bfState.delay < 0 ? 10 : bfState.delay,
        askForFrequency: false,
      ));
    });
  }

  Future<void> _canEnableBackgroundMode() async {
    final hasAccessToLocationAllTime = await _checkAccessToLocationAllTime();
    emit(state.copyWith(hasAccessToLocationAllTime: hasAccessToLocationAllTime));
  }

  Future<void> _checkOptionalPermissions() async {
    final hasAccessToPhoneState = await _checkAccessToPhoneState();
    final hasAccessToNotifications = await _checkAccessToNotifications();

    emit(state.copyWith(
      hasAccessToPhoneState: hasAccessToPhoneState,
      hasAccessToNotifications: hasAccessToNotifications,
    ));
  }

  bool _everAskedForLocationAllTime() {
    final everAskedForLocationAllTime = _localStorage.getEverAskedForLocationAllTime();
    if (!everAskedForLocationAllTime) {
      _localStorage.setEverAskedForLocationAllTime();
    }
    return everAskedForLocationAllTime;
  }

  Future<bool> _checkAccessToLocationAllTime() async =>
      await Permission.locationAlways.status.isGranted;

  Future<bool> _checkAccessToPhoneState() async => await Permission.phone.status.isGranted;

  Future<bool> _requestAccessToPhoneState() async => await Permission.phone.request().isGranted;

  Future<bool> _checkAccessToNotifications() async =>
      await Permission.notification.status.isGranted;

  Future<bool> _requestAccessToNotifications() async =>
      await Permission.notification.request().isGranted;

  Future<void> _loadWarnings() => _warningsService.getWarnings();

  void _listenToWarnings() {
    _warningsSubscription = _warningsService.warnings.listen(
      (event) {
        final parsedWarnings =
            event.map((warning) => WarningViewModel.fromWarning(warning)).toList();

        state.warnings?.forEach((warning) {
          if (warning.title == IWarningsService.locationPermissionWarningName ||
              warning.title == IWarningsService.phoneStatePermissionWarningName ||
              warning.title == IWarningsService.notificationPermissionWarningName) {
            parsedWarnings.add(warning);
          }
        });

        parsedWarnings.sort((a, b) => a.priority.compareTo(b.priority));

        emit(state.copyWith(warnings: parsedWarnings));
      },
    );
  }

  @override
  Future<void> close() {
    _warningsSubscription?.cancel();
    _backgroundFetchStateSubscription?.cancel();
    return super.close();
  }
}
