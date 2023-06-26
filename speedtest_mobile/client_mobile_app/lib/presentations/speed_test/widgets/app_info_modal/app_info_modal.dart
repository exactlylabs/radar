import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/app_info.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/update_location_settings_dialog.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/wardriving_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_state.dart';

class AppInfoModal extends StatelessWidget {
  const AppInfoModal({
    Key? key,
    required this.versionNumber,
    required this.buildNumber,
  }) : super(key: key);

  final String versionNumber;
  final String buildNumber;

  @override
  Widget build(BuildContext context) {
    return BlocListener<AppInfoModalCubit, AppInfoModalState>(
      listenWhen: (previous, current) =>
          current.locationSettingsShouldBeUpdated || (!previous.setDelay && current.setDelay),
      listener: (context, state) {
        if (state.locationSettingsShouldBeUpdated) {
          showUpdateLocationSettingsDialog(context);
        } else {
          _openWardrivingModal(context);
        }
      },
      child: BlocBuilder<AppInfoModalCubit, AppInfoModalState>(
        builder: (context, state) => AppInfo(
          isEnabled: state.isEnabled,
          delay: state.delay,
          configWarning: state.configWarnings != null && state.configWarnings!.isNotEmpty
              ? state.configWarnings!.first
              : null,
          buildAndVersionNumber: 'App version $versionNumber · Build $buildNumber',
          onEnabled: () => context.read<AppInfoModalCubit>().enableWardrivingMode(),
          onDisabled: () {
            context.read<AppInfoModalCubit>().disableWardrivingMode();
            context.read<BackgroundFetchBloc>().disableBackgroundSpeedTest();
          },
        ),
      ),
    );
  }

  Future<void> _openWardrivingModal(BuildContext context) {
    return showModalBottomSheet(
      context: context,
      enableDrag: true,
      isScrollControlled: false,
      backgroundColor: Theme.of(context).colorScheme.background,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16.0),
          topRight: Radius.circular(16.0),
        ),
      ),
      builder: (_) => BlocProvider.value(
        value: context.read<AppInfoModalCubit>(),
        child: ModalWithTitle(
          title: Strings.emptyString,
          body: const WardrivingModal(),
          onPop: () => context.read<AppInfoModalCubit>().cancel(),
        ),
      ),
    );
  }
}
