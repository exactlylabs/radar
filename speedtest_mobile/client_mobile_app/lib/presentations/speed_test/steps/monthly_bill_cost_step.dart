import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/bill_cost_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';

class MonthlyBillCostStep extends StatelessWidget {
  const MonthlyBillCostStep({
    Key? key,
    this.billCost,
    required this.isStepValid,
  }) : super(key: key);

  final int? billCost;
  final bool isStepValid;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Stack(
          children: [
            GestureDetector(
              onTap: () => FocusScope.of(context).requestFocus(FocusNode()),
              child: Column(
                children: [
                  const SizedBox(height: 5.0),
                  const TitleAndSubtitle(
                    title: Strings.monthlyBillCostStepTitle,
                    subtitle: Strings.monthlyBillCostStepSubtitle,
                    subtitleHeight: 1.56,
                    titleHeight: 1.36,
                  ),
                  SpacerWithMax(size: height * 0.037, maxSize: 30.0),
                  BillCostInputField(
                    billCost: billCost,
                    onChanged: (value) => context.read<SpeedTestCubit>().setMonthlyBillCost(int.tryParse(value) ?? 0),
                  ),
                  SpacerWithMax(size: height * 0.025, maxSize: 20.0),
                  PreferNotToAnswerButton(onPressed: (_) => context.read<SpeedTestCubit>().preferNotToAnswer()),
                ],
              ),
            ),
            Positioned(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 0.0,
              right: 0.0,
              child: BlocBuilder<NavigationCubit, NavigationState>(
                builder: (context, state) => Padding(
                  padding: const EdgeInsets.only(bottom: 40.0),
                  child: GoBackAndContinueButtons(
                    onContinuePressed: isStepValid ? onContinuePressed(context, state.canNavigate) : null,
                    onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  VoidCallback onContinuePressed(BuildContext context, bool canNavigate) {
    onCanNavigate() => context.read<SpeedTestCubit>().nextStep();
    return canNavigate ? onCanNavigate : () => openNoInternetConnectionModal(context, onCanNavigate);
  }
}
