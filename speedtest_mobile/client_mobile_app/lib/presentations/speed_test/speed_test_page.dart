import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/dot.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_form.dart';
import 'package:client_mobile_app/presentations/speed_test/accept_terms_page.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_state.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';
import 'package:client_mobile_app/presentations/speed_test/no_internet_connection_page.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/app_info_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/bloc/app_info_modal_state.dart';

class SpeedTestPage extends StatelessWidget {
  const SpeedTestPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider<AppInfoModalCubit>(
      create: (context) => AppInfoModalCubit(
        warningsService: context.read<IWarningsService>(),
        isBackgroundModeEnabled: context.read<BackgroundFetchBloc>().state.isEnabled,
      ),
      child: BlocListener<BackgroundFetchBloc, BackgroundFetchState>(
        listenWhen: (previous, current) => previous.isEnabled != current.isEnabled,
        listener: (context, state) {
          context.read<AppInfoModalCubit>().updateBackgroundMode(state.isEnabled);
        },
        child: BlocBuilder<AppInfoModalCubit, AppInfoModalState>(
          builder: (context, appInfoModalState) => BlocBuilder<SpeedTestCubit, SpeedTestState>(
            builder: (context, state) {
              return Column(
                children: [
                  AppBar(
                    centerTitle: true,
                    toolbarHeight: 50.0,
                    backgroundColor: Theme.of(context).colorScheme.background,
                    title: Image.asset(Images.logoGrey, fit: BoxFit.contain),
                    actions: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10.0),
                        child: InkWell(
                          onTap: () =>
                              _openInfoModal(context, state.versionNumber, state.buildNumber),
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              Image.asset(Images.infoGreyIcon),
                              if (appInfoModalState.isEnabled &&
                                  appInfoModalState.configWarnings != null)
                                SizedBox(
                                  width: 20.0,
                                  height: 20.0,
                                  child: Align(
                                    alignment: const Alignment(1.2, 1),
                                    child: Dot(
                                      color: appInfoModalState.configWarnings!.isNotEmpty
                                          ? AppColors.rockfish
                                          : AppColors.blue,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (state.isLoadingTerms)
                    Container()
                  else if (!state.termsAccepted)
                    const AcceptTermsPage()
                  else if (state.isFormEnded)
                    const NoInternetConnectionPage()
                  else
                    SpeedTestForm(
                      step: state.step,
                      location: state.location,
                      isStepValid: state.isStepValid,
                      networkType: state.networkType,
                      networkLocation: state.networkLocation,
                      monthlyBillCost: state.monthlyBillCost,
                    )
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _openInfoModal(BuildContext context, String? versionNumber, String? buildNumber) {
    return showModalBottomSheet(
      context: context,
      enableDrag: true,
      isScrollControlled: true,
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
          body: AppInfoModal(
            versionNumber: versionNumber ?? Strings.emptyString,
            buildNumber: buildNumber ?? Strings.emptyString,
          ),
        ),
      ),
    );
  }
}
