import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/results_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/summary_table.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/bloc/take_speed_test_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/take_speed_test_step/widgets/inherited_form_information.dart';

class StartSpeedTestStep extends StatelessWidget {
  const StartSpeedTestStep({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const TitleAndSubtitle(
          title: Strings.startSpeedTestStepTitle,
          subtitle: Strings.startSpeedTestStepSubtitle,
          titleHeight: 1.81,
          subtitleHeight: 1.56,
        ),
        SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        SummaryTable(
          address: InheritedFormInformation.of(context).address,
          networkType: InheritedFormInformation.of(context).networkType,
          networkPlace: InheritedFormInformation.of(context).networkPlace,
        ),
        SpacerWithMax(size: height * 0.0616, maxSize: 50.0),
        BlocBuilder<NavigationCubit, NavigationState>(
          builder: (context, state) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: 5.0),
            child: PrimaryButton(
              onPressed: onContinuePressed(context, state.canNavigate),
              child: Text(
                Strings.startSpeedTestButtonLabel,
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 600,
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ),
            ),
          ),
        ),
        SpacerWithMax(size: height * 0.068, maxSize: 55.0),
        const ResultsTable(isEnabled: false),
        SpacerWithMax(size: height * 0.0616, maxSize: 50.0),
      ],
    );
  }

  onContinuePressed(BuildContext context, bool canNavigate) {
    onCanNavigate() => context.read<TakeSpeedTestStepCubit>().startDownloadTest();
    return canNavigate ? onCanNavigate : () => openNoInternetConnectionModal(context, onCanNavigate);
  }
}
