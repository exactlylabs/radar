import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/bill_cost_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';

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
    return Column(
      children: [
        const TitleAndSubtitle(
          title: Strings.monthlyBillCostStepTitle,
          subtitle: Strings.monthlyBillCostStepSubtitle,
        ),
        SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        BillCostInputField(
          billCost: billCost,
          onChanged: (value) => context.read<SpeedTestCubit>().setMonthlyBillCost(int.tryParse(value) ?? 0),
        ),
        SpacerWithMax(size: height * 0.025, maxSize: 20.0),
        PreferNotToAnswerButton(onPressed: (_) {
          context.read<SpeedTestCubit>().setMonthlyBillCost(0);
          context.read<SpeedTestCubit>().nextStep();
        }),
        SpacerWithMax(size: height * 0.018, maxSize: 15.0),
        GoBackAndContinueButtons(
          onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
          onContinuePressed: isStepValid ? () => context.read<SpeedTestCubit>().nextStep() : null,
        ),
        SpacerWithMax(size: height * 0.053, maxSize: 45.0),
      ],
    );
  }
}
