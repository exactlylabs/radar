import 'package:flutter/material.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import 'package:client_mobile_app/speed_test_gauge.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/core/ndt7_js_client_handler/NDT7JSClientHandler.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/inherited_form_information.dart';

class TestingSpeedStep extends StatefulWidget {
  const TestingSpeedStep({
    Key? key,
    this.download,
    this.upload,
    this.loss,
    this.latency,
    this.progress = 0.0,
    required this.isDownloadTest,
    required this.onTestComplete,
    required this.onTestMeasurement,
    required this.onTestError,
  }) : super(key: key);

  final double? upload;
  final double? download;
  final double? loss;
  final double? latency;
  final double progress;
  final bool isDownloadTest;
  final Function(String, String) onTestComplete;
  final Function(String, String) onTestMeasurement;
  final Function(String) onTestError;

  @override
  State<TestingSpeedStep> createState() => _TestingSpeedStepState();
}

class _TestingSpeedStepState extends State<TestingSpeedStep> {
  late FlutterWebviewPlugin flutterWebViewPlugin;
  Set<JavascriptChannel> javascriptChannels = <JavascriptChannel>{};

  @override
  void initState() {
    super.initState();
    flutterWebViewPlugin = FlutterWebviewPlugin();
    final javascriptChannels = NDT7JSClientHandler.setJavascriptsChannels(
      onTestComplete: widget.onTestComplete,
      onTestMeasurement: widget.onTestMeasurement,
      onTestError: widget.onTestError,
    );
    NDT7JSClientHandler.launchClient(flutterWebViewPlugin, javascriptChannels);
  }

  @override
  void dispose() {
    super.dispose();
    flutterWebViewPlugin.dispose();
  }

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
          progress: widget.progress,
        ),
        SpacerWithMax(size: height * 0.0616, maxSize: 50.0),
        SizedBox(
          height: width * 0.565 < 212 ? width * 0.565 : 212,
          width: width * 0.565 < 212 ? width * 0.565 : 212,
          child: Center(
            child: SpeedTestGauge(
              speed: (widget.isDownloadTest ? widget.download : widget.upload) ?? 0,
              minSpeed: 0,
              maxSpeed: 100,
              gaugeWidth: 16,
              fractionDigits: 2,
              isDownloadTest: widget.isDownloadTest,
              animate: true,
              minMaxTextStyle: AppTextStyle(
                fontSize: 13.0,
                color: AppColors.lightGray.withOpacity(0.5),
                fontWeight: 700,
              ),
              unitOfMeasurementTextStyle: AppTextStyle(
                fontSize: 14.0,
                color: AppColors.deepBlue,
                fontWeight: 600,
                height: 2,
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
                text: widget.isDownloadTest ? Strings.speedgaugeDownloadLabel : Strings.speedgaugeUploadLabel,
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
          download: widget.isDownloadTest ? null : widget.download?.toStringAsFixed(2),
          upload: !widget.isDownloadTest ? null : widget.upload?.toStringAsFixed(2),
          latency: widget.latency?.toStringAsFixed(2),
          loss: widget.loss?.toStringAsFixed(2),
        ),
        SpacerWithMax(size: height * 0.0493, maxSize: 40.0),
      ],
    );
  }
}
