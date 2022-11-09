import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/result_item.dart';

class ResultsTable extends StatelessWidget {
  const ResultsTable({
    Key? key,
    this.download,
    this.upload,
    this.latency,
    this.loss,
    this.isEnabled = true,
  }) : super(key: key);

  final bool isEnabled;
  final String? download;
  final String? upload;
  final String? latency;
  final String? loss;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 35.0),
      decoration: BoxDecoration(
        color: isEnabled
            ? Theme.of(context).colorScheme.onPrimary
            : Theme.of(context).colorScheme.onPrimary.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 0),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ResultItem(
                  icon: Images.downloadIcon,
                  name: Strings.downloadResultsLabel,
                  unit: Strings.downloadResultsUnit,
                  value: download,
                  isEnabled: isEnabled,
                ),
                Divider(color: Theme.of(context).colorScheme.surface.withOpacity(0.3), thickness: 1.0),
                ResultItem(
                  icon: Images.latencyIcon,
                  name: Strings.latencyResultsLabel,
                  unit: Strings.latencyResultsUnit,
                  value: latency,
                  isEnabled: isEnabled,
                ),
              ],
            ),
          ),
          const SizedBox(width: 25.0),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                ResultItem(
                  icon: Images.uploadIcon,
                  name: Strings.uploadResultsLabel,
                  unit: Strings.uploadResultsUnit,
                  value: upload,
                  isEnabled: isEnabled,
                ),
                Divider(color: Theme.of(context).colorScheme.surface.withOpacity(0.3), thickness: 1.0),
                ResultItem(
                  icon: Images.lossIcon,
                  name: Strings.lossResultsLabel,
                  unit: Strings.lossResultsUnit,
                  value: loss,
                  isEnabled: isEnabled,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
