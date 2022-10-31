import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class StartSpeedTestStep extends StatelessWidget {
  const StartSpeedTestStep({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TitleAndSubtitle(
          title: 'You’re ready to start.',
          subtitle:
              'For more accurate results, please make sure you are not currently making heavy use of your internet connection.',
        ),
        SizedBox(height: 30.0),
        SummaryTable(
          address: '3531 Wallingford Ave N',
          networkType: 'Cellular',
          networkPlace: 'Home',
        ),
        SizedBox(height: 50.0),
        PrimaryButton(
          child: Text(
            'Start Speed Test',
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 600,
              color: Theme.of(context).colorScheme.onPrimary,
            ),
          ),
          onPressed: () {},
        ),
        SizedBox(height: 55.0),
        ResultsTable(
          isEnabled: false,
        ),
        SizedBox(height: 50.0),
      ],
    );
  }
}
