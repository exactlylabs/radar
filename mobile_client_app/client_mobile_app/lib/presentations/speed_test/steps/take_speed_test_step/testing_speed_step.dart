import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class TestingSpeedStep extends StatelessWidget {
  const TestingSpeedStep({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SummaryTable(
          address: '3531 Wallingford Ave N',
          networkType: 'Cellular',
          networkPlace: 'Home',
        ),
        Container(
          height: 230.0,
          child: Center(child: Text('Speed gauge here')),
        ),
        ResultsTable(),
        SizedBox(height: 40.0),
      ],
    );
  }
}
