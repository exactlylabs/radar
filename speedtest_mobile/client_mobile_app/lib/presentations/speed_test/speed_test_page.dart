import 'package:get_it/get_it.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/widgets/dot.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/core/local_storage/local_storage.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_form.dart';
import 'package:client_mobile_app/presentations/speed_test/accept_terms_page.dart';
import 'package:client_mobile_app/core/background_fetch/bloc/background_fetch_bloc.dart';
import 'package:client_mobile_app/core/services/warnings_service/i_warnings_service.dart';
import 'package:client_mobile_app/presentations/speed_test/no_internet_connection_page.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/info_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/background_mode_bloc/background_mode_state.dart';

class SpeedTestPage extends StatelessWidget {
  const SpeedTestPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider<BackgroundModeCubit>(
      create: (context) => BackgroundModeCubit(
        localStorage: GetIt.I<LocalStorage>(),
        warningsService: context.read<IWarningsService>(),
        backgroundFetchStateListener: context.read<BackgroundFetchBloc>().stream,
        backgroundFetchIsEnabled: context.read<BackgroundFetchBloc>().state.isEnabled,
        backgroundFetchFrequency: context.read<BackgroundFetchBloc>().state.delay,
      ),
      child: BlocBuilder<BackgroundModeCubit, BackgroundModeState>(
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
                            if (appInfoModalState.backgroundMode &&
                                appInfoModalState.warnings != null)
                              SizedBox(
                                width: 20.0,
                                height: 20.0,
                                child: Align(
                                  alignment: const Alignment(1.2, 1),
                                  child: Dot(
                                    color: appInfoModalState.warnings!.isNotEmpty
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
        value: context.read<BackgroundModeCubit>(),
        child: ModalWithTitle(
          title: Strings.emptyString,
          body: InfoModal(
            versionNumber: versionNumber ?? Strings.emptyString,
            buildNumber: buildNumber ?? Strings.emptyString,
          ),
        ),
      ),
    );
  }
}
