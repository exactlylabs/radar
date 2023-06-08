import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_form_body.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/steps_indicator.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';

class SpeedTestForm extends StatelessWidget {
  const SpeedTestForm({
    Key? key,
    required this.step,
    required this.isStepValid,
    this.location,
    this.networkType,
    this.monthlyBillCost,
    this.networkLocation,
  }) : super(key: key);

  final int step;
  final bool isStepValid;
  final Location? location;
  final String? networkType;
  final int? monthlyBillCost;
  final String? networkLocation;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: WillPopScope(
        onWillPop: _onWillPop(context),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              return SingleChildScrollView(
                child: ConstrainedBox(
                  constraints: BoxConstraints(minWidth: constraints.maxWidth, minHeight: constraints.maxHeight),
                  child: IntrinsicHeight(
                    child: Column(
                      children: [
                        if (step < SpeedTestCubit.TAKE_SPEED_TEST_STEP)
                          Padding(
                            padding: const EdgeInsets.only(top: 10.0, bottom: 15.0),
                            child: StepIndicator(
                              totalSteps: 3,
                              currentStep: step,
                              textColor: Theme.of(context).colorScheme.surface,
                              currentTextColor: Theme.of(context).colorScheme.onPrimary,
                              stepColor: Theme.of(context).colorScheme.primary.withOpacity(0.10),
                              currentStepColor: Theme.of(context).colorScheme.secondary,
                            ),
                          ),
                        SpeedTestFormBody(
                          step: step,
                          isStepValid: isStepValid,
                          location: location,
                          networkType: networkType,
                          monthlyBillCost: monthlyBillCost,
                          networkLocation: networkLocation,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Future<bool> Function()? _onWillPop(BuildContext context) => () {
        context.read<SpeedTestCubit>().previousStep();
        return Future.value(false);
      };
}
