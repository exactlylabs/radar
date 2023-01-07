import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/explore_your_area_button.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/inherited_form_information.dart';

class TestResultsStep extends StatelessWidget {
  const TestResultsStep({
    Key? key,
    required this.download,
    required this.upload,
    required this.latency,
    required this.loss,
  }) : super(key: key);

  final double download;
  final double upload;
  final double latency;
  final double loss;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 9.0),
          child: Text(
            Strings.testResultsStepTitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 22.0,
              fontWeight: 800,
              height: 1.81,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        SpacerWithMax(size: height * 0.031, maxSize: 20.0),
        SummaryTable(
          address: InheritedFormInformation.of(context).address,
          networkType: InheritedFormInformation.of(context).networkType,
          networkPlace: InheritedFormInformation.of(context).networkPlace,
        ),
        SpacerWithMax(size: height * 0.031, maxSize: 25.0),
        ResultsTable(
          download: download.toStringAsFixed(2),
          upload: upload.toStringAsFixed(2),
          latency: latency.toStringAsFixed(2),
          loss: loss.toStringAsFixed(2),
        ),
        SpacerWithMax(size: height * 0.031, maxSize: 25.0),
        Text(
          Strings.testResultsStepDescription,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: 1.56,
            letterSpacing: 0.25,
            color: AppColors.darkGrey,
          ),
        ),
        ExploreYoutAreaButton(
          onPressed: () {
            context.read<NavigationCubit>().changeTab(2);
            context.read<SpeedTestCubit>().resetForm();
            context.read<TakeSpeedTestStepCubit>().resetSpeedTest();
          },
        ),
        SpacerWithMax(size: height * 0.037, maxSize: 17.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5.0),
          child: PrimaryButton(
            child: Text(
              Strings.viewAllResultsButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 600,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
            onPressed: () {
              context.read<NavigationCubit>().changeTab(1);
              context.read<SpeedTestCubit>().resetForm();
              context.read<TakeSpeedTestStepCubit>().resetSpeedTest();
            },
          ),
        ),
        SpacerWithMax(size: height * 0.025, maxSize: 20.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5.0),
          child: PrimaryButton(
            color: Theme.of(context).colorScheme.onPrimary,
            shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
            child: Text(
              Strings.testAgainButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: AppColors.darkGrey,
              ),
            ),
            onPressed: () => context.read<TakeSpeedTestStepCubit>().startDownloadTest(),
          ),
        ),
        SpacerWithMax(size: height * 0.053, maxSize: 45.0),
      ],
    );
  }
}
