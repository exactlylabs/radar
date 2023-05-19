import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/bill_cost_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/prefer_not_to_answer_button.dart';

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
    setOnContinueAndOnGoBackPressed(context);
    return GestureDetector(
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
    );
  }

  void setOnContinueAndOnGoBackPressed(BuildContext context) {
    VoidCallback? onContinueCallback = isStepValid ? () => context.read<SpeedTestCubit>().nextStep() : null;

    context
        .read<SpeedTestCubit>()
        .setOnContinueAndOnGoBackPressed(onContinueCallback, () => context.read<SpeedTestCubit>().previousStep());
  }
}
