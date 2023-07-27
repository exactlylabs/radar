import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/app_info.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/permission_modals/location_all_time_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_frequency_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/permission_modals/optional_permissions_modal/optional_permissions_modal.dart';

class InfoModal extends StatefulWidget {
  const InfoModal({
    Key? key,
    required this.buildNumber,
    required this.versionNumber,
    required this.sessionId,
  }) : super(key: key);

  final String buildNumber;
  final String versionNumber;
  final String sessionId;

  @override
  State<InfoModal> createState() => _InfoModalState();
}

class _InfoModalState extends State<InfoModal> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      context.read<BackgroundModeCubit>().onAppResumed();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<BackgroundModeCubit, BackgroundModeState>(
      listenWhen: (previous, current) =>
          (!previous.askForLocationAllTime && current.askForLocationAllTime) ||
          (!previous.askForOptionalPermissions && current.askForOptionalPermissions) ||
          (!previous.askForFrequency && current.askForFrequency) ||
          (current.backgroundMode && !(current.hasAccessToLocationAllTime ?? false)),
      listener: (context, state) {
        if (state.askForLocationAllTime) {
          askForLocationAllTimeModal(context);
        } else if (state.askForOptionalPermissions) {
          askForOptionalPermissionsModal(context);
        } else if (state.askForFrequency) {
          askForBackgroundModeFrequency(context, state.frequency,
              () => context.read<BackgroundModeCubit>().cancelBackgroundModeFrequency());
        } else if (state.backgroundMode && !(state.hasAccessToLocationAllTime ?? false)) {
          context.read<BackgroundFetchBloc>().disableBackgroundSpeedTest();
        }
      },
      child: BlocBuilder<BackgroundModeCubit, BackgroundModeState>(
        builder: (context, state) {
          final warning = (state.warnings?.isNotEmpty ?? false) ? state.warnings!.first : null;
          return AppInfo(
            isEnabled: state.backgroundMode,
            frequency: state.frequency,
            warning: warning,
            buildNumber: widget.buildNumber,
            versionNumber: widget.versionNumber,
            sessionId: widget.sessionId,
            onEnabled: (warning?.isOptional ?? true)
                ? () => context.read<BackgroundModeCubit>().enableBackgroundMode()
                : null,
            onDisabled: () => context.read<BackgroundFetchBloc>().disableBackgroundSpeedTest(),
          );
        },
      ),
    );
  }
}
