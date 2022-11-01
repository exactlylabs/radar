import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/speed_test_gauge.dart';
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
        SizedBox(
          // padding: const EdgeInsets.all(40.0),
          height: 250,
          width: 250,
          child: Center(
            // Center is a layout widget. It takes a single child and positions it
            // in the middle of the parent.
            child: SpeedTestGauge(
              minSpeed: 0,
              maxSpeed: 100,
              gaugeWidth: 20,
              speed: 10,
              fractionDigits: 2,
              isDownloadTest: false,
              minMaxTextStyle: AppTextStyle(
                fontSize: 15.0,
                color: AppColors.lightGray.withOpacity(0.5),
                fontWeight: 700,
              ),
              unitOfMeasurementTextStyle: AppTextStyle(
                fontSize: 14.0,
                color: AppColors.deepBlue,
                fontWeight: 600,
              ),
              speedTextStyle: AppTextStyle(
                fontSize: 38.0,
                color: AppColors.deepBlue,
                fontWeight: 700,
              ),
            ),
          ),
        ),
        ResultsTable(),
        SizedBox(height: 40.0),
      ],
    );
  }
}
