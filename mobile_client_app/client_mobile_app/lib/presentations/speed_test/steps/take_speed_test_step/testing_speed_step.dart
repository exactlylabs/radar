import 'package:flutter/material.dart';
import 'package:client_mobile_app/speed_test_gauge.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/inherited_form_information.dart';

class TestingSpeedStep extends StatelessWidget {
  const TestingSpeedStep({
    Key? key,
    this.download,
    this.upload,
    this.loss,
    this.latency,
    required this.isDownloadTest,
  }) : super(key: key);

  final double? upload;
  final double? download;
  final double? loss;
  final double? latency;
  final bool isDownloadTest;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    final double width = MediaQuery.of(context).size.width;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SummaryTable(
          address: InheritedFormInformation.of(context).address,
          networkType: InheritedFormInformation.of(context).networkType,
          networkPlace: InheritedFormInformation.of(context).networkPlace,
        ),
        SpacerWithMax(size: height * 0.0616, maxSize: 50.0),
        SizedBox(
          height: width * 0.565 < 250 ? width * 0.565 : 250,
          width: width * 0.565 < 250 ? width * 0.565 : 250,
          child: Center(
            child: SpeedTestGauge(
              speed: (isDownloadTest ? download : upload) ?? 0,
              minSpeed: 0,
              maxSpeed: 100,
              gaugeWidth: 20,
              fractionDigits: 2,
              isDownloadTest: isDownloadTest,
              animate: true,
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
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            text: Strings.speedgaugeTestingLabel,
            style: AppTextStyle(
              fontSize: 15.0,
              color: Theme.of(context).colorScheme.tertiary,
              fontWeight: 400,
            ),
            children: [
              TextSpan(
                text: isDownloadTest ? Strings.speedgaugeDownloadLabel : Strings.speedgaugeUploadLabel,
                style: AppTextStyle(
                  fontSize: 15.0,
                  color: Theme.of(context).colorScheme.tertiary,
                  fontWeight: 700,
                ),
              ),
              const TextSpan(text: Strings.speedgaugeSpeedLabel),
            ],
          ),
        ),
        SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        ResultsTable(
          download: isDownloadTest ? null : download?.toStringAsFixed(2),
          upload: !isDownloadTest ? null : upload?.toStringAsFixed(2),
          latency: latency?.toStringAsFixed(2),
          loss: loss?.toStringAsFixed(2),
        ),
        SpacerWithMax(size: height * 0.0493, maxSize: 40.0),
      ],
    );
  }
}
