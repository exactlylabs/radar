import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/core/background_fetch/background_fetch_handler.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_state.dart';

class BackgroundFetchBloc extends Cubit<BackgroundFetchState> {
  BackgroundFetchBloc({
    required LocalStorage localStorage,
  })  : _localStorage = localStorage,
        super(const BackgroundFetchState()) {
    _loadPreferences();
  }

  final LocalStorage _localStorage;

  Future<void> _loadPreferences() async {
    if (!_localStorage.isLocalStorageOpen()) {
      await _localStorage.openLocalStorage();
    }
    final backgroundSpeedTestDelay = _localStorage.getBackgroundSpeedTestDelay();
    if (backgroundSpeedTestDelay >= 0) {
      emit(BackgroundFetchState(delay: backgroundSpeedTestDelay, isEnabled: true));
      BackgroundFetchHandler.startBackgroundSpeedTest(backgroundSpeedTestDelay * 60000);
    }
  }

  Future<void> enableBackgroundSpeedTest() async {
    if (!state.isEnabled && state.delay >= 0) {
      emit(BackgroundFetchState(delay: state.delay, isEnabled: true));
      await _localStorage.setBackgroundSpeedTestDelay(state.delay);
      BackgroundFetchHandler.stopBackgroundSpeedTest();
      BackgroundFetchHandler.startBackgroundSpeedTest(state.delay * 60000);
    }
  }

  Future<void> disableBackgroundSpeedTest() async {
    if (state.isEnabled) {
      emit(const BackgroundFetchState(delay: -1, isEnabled: false));
      await _localStorage.setBackgroundSpeedTestDelay(-1);
      BackgroundFetchHandler.stopBackgroundSpeedTest();
    }
  }

  void setDelay(int delay) {
    emit(BackgroundFetchState(delay: delay, isEnabled: state.isEnabled));
  }
}
