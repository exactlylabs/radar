import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/bill_cost_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class MonthlyBillCostStep extends StatelessWidget {
  const MonthlyBillCostStep({
    Key? key,
    this.billCost,
  }) : super(key: key);

  final int? billCost;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const TitleAndSubtitle(
          title: Strings.monthlyBillCostStepTitle,
          subtitle: Strings.monthlyBillCostStepSubtitle,
        ),
        const SizedBox(height: 30.0),
        BillCostInputField(
          billCost: billCost,
          onChanged: (value) => context.read<SpeedTestCubit>().setMonthlyBillCost(int.tryParse(value) ?? 0),
        ),
        const SizedBox(height: 20.0),
        const PreferNotToAnswerButton(),
        const SizedBox(height: 35.0),
        GoBackAndContinueButtons(
          onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
          onContinuePressed: () => context.read<SpeedTestCubit>().nextStep(),
        ),
        const SizedBox(height: 45.0),
      ],
    );
  }
}
