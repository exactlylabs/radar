import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/app_info.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/enable_wardriving_mode.dart';
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
    return BlocProvider(
      create: (context) => AppInfoModalCubit(),
      child: BlocBuilder<AppInfoModalCubit, AppInfoModalState>(
        builder: (context, state) {
          return state.enableWardrivingMode
              ? EnableWardrivingMode(
                  onCancel: () => context.read<AppInfoModalCubit>().cancel(),
                  onChanged: (delay) {
                    context.read<AppInfoModalCubit>().updateDelay(delay);
                    context.read<BackgroundFetchBloc>().setDelay(int.tryParse(delay) ?? -1);
                  },
                  onEnabled: () {
                    context.read<BackgroundFetchBloc>().enableBackgroundSpeedTest();
                    Navigator.of(context).pop();
                  },
                  warning: state.warning,
                )
              : AppInfo(
                  buildAndVersionNumber: 'App version $versionNumber · Build $buildNumber',
                  onEnabled: () => context.read<AppInfoModalCubit>().enableWardrivingMode(),
                  onDisabled: () => context.read<BackgroundFetchBloc>().disableBackgroundSpeedTest(),
                );
        },
      ),
    );
  }
}
