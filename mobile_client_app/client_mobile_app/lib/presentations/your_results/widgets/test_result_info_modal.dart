import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class TestResultInfoModal extends StatelessWidget {
  const TestResultInfoModal({
    Key? key,
    required this.date,
    required this.time,
    required this.address,
    required this.networkPlace,
    required this.networkType,
    required this.networkQuality,
    required this.downloadSpeed,
    required this.uploadSpeed,
    required this.latency,
    required this.loss,
  }) : super(key: key);

  final String date;
  final String time;
  final String address;
  final String networkType;
  final String networkPlace;
  final String networkQuality;
  final double downloadSpeed;
  final double uploadSpeed;
  final double latency;
  final double loss;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          Strings.testResultsModalTitle,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 20.0,
            fontWeight: 800,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 10.0),
        Text(
          '$date $time',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: 1.56,
            color: Theme.of(context).colorScheme.tertiary,
          ),
        ),
        const SizedBox(height: 25.0),
        SummaryTable(
          address: address,
          networkType: networkType.isEmpty ? Strings.optionNotAnswered : networkType,
          networkPlace: networkPlace.isEmpty ? Strings.optionNotAnswered : networkPlace,
        ),
        const SizedBox(height: 30.0),
        ResultsTable(
          download: downloadSpeed.toStringAsFixed(2),
          upload: uploadSpeed.toStringAsFixed(2),
          latency: latency.toStringAsFixed(2),
          loss: loss.toStringAsFixed(2),
        ),
        const SizedBox(height: 45.0),
        PrimaryButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(
            Strings.okButtonLabel,
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 700,
              color: Theme.of(context).colorScheme.onPrimary,
            ),
          ),
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}
