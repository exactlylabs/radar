import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
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
          current.locationSettingsShouldBeUpdated ||
          (previous.enableWardrivingMode != current.enableWardrivingMode),
      listener: (context, state) {
        if (state.locationSettingsShouldBeUpdated) {
          showUpdateLocationSettingsDialog(context);
        } else {
          _openWardrivingModal(context);
        }
      },
      child: BlocBuilder<AppInfoModalCubit, AppInfoModalState>(
        builder: (context, state) => AppInfo(
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

  Future<void> _openWardrivingModal(BuildContext context) async {
    return modalWithTitle(
      context,
      true,
      Strings.emptyString,
      const WardrivingModal(),
      () => context.read<AppInfoModalCubit>().cancel(),
      null,
      false,
    );
  }
}
