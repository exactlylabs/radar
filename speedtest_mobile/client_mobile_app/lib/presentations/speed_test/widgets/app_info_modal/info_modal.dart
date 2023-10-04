import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/modal_tabs.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/app_info_tab.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_tab.dart';
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

  static const int BGM_TAB = 1;
  static const int INFO_TAB = 0;
}

class _InfoModalState extends State<InfoModal> with WidgetsBindingObserver {
  late int currentTab;

  @override
  void initState() {
    super.initState();
    currentTab = InfoModal.INFO_TAB;
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && currentTab == InfoModal.BGM_TAB) {
      context.read<BackgroundModeCubit>().onAppResumed();
    }
  }

  void changeTab(int tab) {
    setState(() => currentTab = tab);
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
          return SizedBox(
            height: MediaQuery.of(context).size.height * 0.8,
            child: Column(
              children: [
                Image.asset(Images.logoBig, height: 32.0),
                const SizedBox(height: 40.0),
                ModalTabs(
                  currentTab: currentTab,
                  backgroundModeWithWarnings: state.backgroundMode ? warning != null : null,
                  onTabChanged: changeTab,
                ),
                if (currentTab == InfoModal.INFO_TAB)
                  AppInfoTab(
                    buildNumber: widget.buildNumber,
                    versionNumber: widget.versionNumber,
                    sessionId: widget.sessionId,
                    server: AppConfig.of(context)!.stringResource.SERVER_NAME,
                  )
                else if (currentTab == InfoModal.BGM_TAB)
                  BackgroundModeTab(
                    isEnabled: state.backgroundMode,
                    frequency: state.frequency,
                    warning: warning,
                    onEnabled: (warning?.isOptional ?? true)
                        ? () => context.read<BackgroundModeCubit>().enableBackgroundMode()
                        : null,
                    onDisabled: () =>
                        context.read<BackgroundFetchBloc>().disableBackgroundSpeedTest(),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
