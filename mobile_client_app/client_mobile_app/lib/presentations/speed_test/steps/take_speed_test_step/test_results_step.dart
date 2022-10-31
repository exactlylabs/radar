import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/explore_your_area_button.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class TestResultsStep extends StatelessWidget {
  const TestResultsStep({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Your test results',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 22.0,
            fontWeight: 800,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        SizedBox(height: 20.0),
        SummaryTable(
          address: '3531 Wallingford Ave N',
          networkType: 'Cellular',
          networkPlace: 'Home',
        ),
        SizedBox(height: 25.0),
        ResultsTable(),
        SizedBox(height: 25.0),
        Text(
          'See how you compare to others.',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            color: Theme.of(context).colorScheme.tertiary,
          ),
        ),
        ExploreYoutAreaButton(),
        SizedBox(height: 20.0),
        PrimaryButton(
          child: Text(
            'View all results',
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 600,
              color: Theme.of(context).colorScheme.onPrimary,
            ),
          ),
          onPressed: () {},
        ),
        SizedBox(height: 20.0),
        PrimaryButton(
          color: Theme.of(context).colorScheme.onPrimary,
          child: Text(
            'View all results',
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 700,
              color: AppColors.darkGrey,
            ),
          ),
          onPressed: () {},
        ),
        SizedBox(height: 40.0),
      ],
    );
  }
}
