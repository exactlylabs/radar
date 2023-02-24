import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_state.dart';

class AppInfoModalCubit extends Cubit<AppInfoModalState> {
  AppInfoModalCubit() : super(const AppInfoModalState());

  void enableWardrivingMode() {
    emit(state.copyWith(enableWardrivingMode: true));
  }

  void cancel() {
    emit(const AppInfoModalState());
  }

  void updateDelay(String delay) {
    final int parsedDelay = int.tryParse(delay) ?? -1;
    if (parsedDelay >= 0 && parsedDelay < 15) {
      emit(state.copyWith(warning: Strings.appInfoModalWarning, delay: parsedDelay));
    } else {
      emit(state.resetWarning().copyWith(delay: parsedDelay));
    }
  }
}
