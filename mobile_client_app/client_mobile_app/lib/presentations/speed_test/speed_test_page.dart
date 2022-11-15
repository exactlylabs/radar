import 'package:client_mobile_app/core/results_service/i_results_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/steps_indicator.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/network_type_step.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/network_place_step.dart';
import 'package:client_mobile_app/presentations/speed_test/no_internet_connection_page.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/monthly_bill_cost_step.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/take_speed_test_step.dart';

class SpeedTestPage extends StatelessWidget {
  const SpeedTestPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return BlocProvider<SpeedTestCubit>(
      create: (_) => SpeedTestCubit(resultsService: context.read<IResultsService>()),
      child: BlocBuilder<SpeedTestCubit, SpeedTestState>(
        builder: (context, state) {
          if (state.isFormEnded) {
            return const NoInternetConnectionPage();
          } else {
            return SingleChildScrollView(
              child: Container(
                color: Theme.of(context).backgroundColor,
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SpacerWithMax(size: height * 0.05, maxSize: 40.0),
                    if (state.step < SpeedTestCubit.TAKE_SPEED_TEST_STEP)
                      Padding(
                        padding: const EdgeInsets.only(top: 10.0, bottom: 15.0),
                        child: StepIndicator(
                          totalSteps: 4,
                          currentStep: state.step,
                          textColor: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                          currentTextColor: Theme.of(context).colorScheme.onPrimary,
                          stepColor: Theme.of(context).colorScheme.primary.withOpacity(0.15),
                          currentStepColor: Theme.of(context).colorScheme.secondary,
                        ),
                      ),
                    if (state.step == SpeedTestCubit.LOCATION_STEP)
                      LocationStep(
                        location: state.location,
                        locationError: state.locationError,
                        termsAccepted: state.termsAccepted,
                        termsError: state.termsError,
                      )
                    else if (state.step == SpeedTestCubit.NETWORK_LOCATION_STEP)
                      NetworkPlaceStep(
                        isStepValid: state.isStepValid,
                        address: state.location?.address ?? Strings.emptyString,
                        optionSelected: state.networkLocation,
                      )
                    else if (state.step == SpeedTestCubit.NETWORK_TYPE_STEP)
                      NetworkTypeStep(
                        optionSelected: state.networkType,
                        isStepValid: state.isStepValid,
                      )
                    else if (state.step == SpeedTestCubit.MONTHLY_BILL_COST_STEP)
                      MonthlyBillCostStep(
                        billCost: state.monthlyBillCost,
                        isStepValid: state.isStepValid,
                      )
                    else if (state.step == SpeedTestCubit.TAKE_SPEED_TEST_STEP)
                      TakeSpeedTestStep(
                        networkType: state.networkType ?? Strings.emptyOption,
                        networkPlace: state.networkLocation ?? Strings.emptyOption,
                        address: state.location?.address ?? Strings.emptyOption,
                      ),
                  ],
                ),
              ),
            );
          }
        },
      ),
    );
  }
}
