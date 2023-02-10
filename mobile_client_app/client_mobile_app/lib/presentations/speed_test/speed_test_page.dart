import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/ftue_app_modal.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/steps_indicator.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/network_place_step.dart';
import 'package:client_mobile_app/presentations/speed_test/no_internet_connection_page.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/monthly_bill_cost_step.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_step.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/take_speed_test_step.dart';

class SpeedTestPage extends StatelessWidget {
  const SpeedTestPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return BlocListener<SpeedTestCubit, SpeedTestState>(
      listenWhen: (previous, current) => current.isFTUEApp,
      listener: (context, state) => _openFTUEAppModal(context),
      child: BlocBuilder<SpeedTestCubit, SpeedTestState>(
        builder: (context, state) {
          if (state.isFormEnded) {
            return const NoInternetConnectionPage();
          } else {
            return WillPopScope(
              onWillPop: () {
                context.read<SpeedTestCubit>().previousStep();
                return Future.value(false);
              },
              child: SafeArea(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return Container(
                      color: Theme.of(context).backgroundColor,
                      padding: EdgeInsets.symmetric(
                          horizontal: state.step == SpeedTestCubit.TAKE_SPEED_TEST_STEP ? 15.0 : 20.0),
                      child: Stack(
                        children: [
                          SingleChildScrollView(
                            child: ConstrainedBox(
                              constraints:
                                  BoxConstraints(minWidth: constraints.maxWidth, minHeight: constraints.maxHeight),
                              child: IntrinsicHeight(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    const SizedBox(height: 11.0),
                                    AppBar(
                                      centerTitle: true,
                                      toolbarHeight: 26.0,
                                      backgroundColor: Theme.of(context).backgroundColor,
                                      title: Image.asset(Images.logoGrey, fit: BoxFit.contain),
                                      actions: [
                                        InkWell(
                                          onTap: () => _openInfoModal(context, state.versionNumber, state.buildNumber),
                                          child: Image.asset(
                                            Images.infoGreyIcon,
                                          ),
                                        ),
                                      ],
                                    ),
                                    SpacerWithMax(size: height * 0.05, maxSize: 40.0),
                                    if (state.step < SpeedTestCubit.TAKE_SPEED_TEST_STEP)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 10.0, bottom: 15.0),
                                        child: StepIndicator(
                                          totalSteps: 3,
                                          currentStep: state.step,
                                          textColor: Theme.of(context).colorScheme.surface,
                                          currentTextColor: Theme.of(context).colorScheme.onPrimary,
                                          stepColor: Theme.of(context).colorScheme.primary.withOpacity(0.10),
                                          currentStepColor: Theme.of(context).colorScheme.secondary,
                                        ),
                                      ),
                                    if (state.step == SpeedTestCubit.LOCATION_STEP)
                                      LocationStep(
                                        location: state.location,
                                        termsAccepted: state.termsAccepted,
                                      )
                                    else if (state.step == SpeedTestCubit.NETWORK_LOCATION_STEP)
                                      NetworkPlaceStep(
                                        isStepValid: state.isStepValid,
                                        address: state.location?.address ?? Strings.emptyString,
                                        optionSelected: state.networkLocation,
                                      )
                                    else if (state.step == SpeedTestCubit.MONTHLY_BILL_COST_STEP)
                                      MonthlyBillCostStep(
                                        billCost: state.monthlyBillCost,
                                        isStepValid: state.isStepValid,
                                      )
                                    else if (state.step == SpeedTestCubit.TAKE_SPEED_TEST_STEP)
                                      TakeSpeedTestStep(
                                        networkType: state.networkType ?? Strings.emptyString,
                                        networkPlace: state.networkLocation ?? Strings.emptyString,
                                        address: state.location?.address ?? Strings.emptyString,
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          if (state.onContinue != null || state.onBack != null)
                            Positioned(
                              bottom: MediaQuery.of(context).viewInsets.bottom,
                              left: 0.0,
                              right: 0.0,
                              child: Padding(
                                padding: EdgeInsets.only(
                                    bottom: state.step == SpeedTestCubit.TAKE_SPEED_TEST_STEP ? 20.0 : 40.0),
                                child: GoBackAndContinueButtons(
                                  onContinuePressed: state.onContinue,
                                  onGoBackPressed: state.onBack,
                                ),
                              ),
                            )
                        ],
                      ),
                    );
                  },
                ),
              ),
            );
          }
        },
      ),
    );
  }

  Future<void> _openInfoModal(BuildContext context, String? versionNumber, String? buildNumber) async {
    return modalWithTitle(
      context,
      false,
      Strings.emptyString,
      AppInfoModal(
        versionNumber: versionNumber ?? Strings.emptyString,
        buildNumber: buildNumber ?? Strings.emptyString,
      ),
    );
  }

  Future<void> _openFTUEAppModal(BuildContext context) {
    return modalWithTitle(
      context,
      true,
      Strings.emptyString,
      const FTUEAppModal(),
    );
  }
}
