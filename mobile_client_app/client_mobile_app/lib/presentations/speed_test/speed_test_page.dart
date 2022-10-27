import 'dart:async';

import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/steps_indicator.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SpeedTestPage extends StatelessWidget {
  const SpeedTestPage({
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double formHeight = MediaQuery.of(context).viewInsets.bottom;
    return BlocProvider<SpeedTestCubit>(
      create: (_) => SpeedTestCubit(),
      child: BlocBuilder<SpeedTestCubit, SpeedTestState>(
        builder: (context, state) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 30.0),
              if (state.step < 4)
                FutureBuilder(
                  future: _loadCheckImageInfo(context),
                  builder: (context, snapshot) {
                    if (snapshot.hasData) {
                      return CustomPaint(
                        painter: StepsIndicator(
                          imageInfo: snapshot.data as ImageInfo,
                          currentStep: state.step,
                          totalSteps: 4,
                          textColor: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                          currentTextColor: Theme.of(context).colorScheme.onPrimary,
                          stepColor: Theme.of(context).colorScheme.primary.withOpacity(0.15),
                          currentStepColor: Theme.of(context).colorScheme.secondary,
                        ),
                        child: Container(height: 20),
                      );
                    } else {
                      return Container();
                    }
                  },
                ),
              const SizedBox(height: 15.0),
              if (state.step == 0)
                Expanded(
                  child: LocationStep(
                    formHeight: formHeight,
                    location: state.location,
                    locationError: state.locationError,
                    termsAccepted: state.termsAccepted,
                    termsError:
                        'Please confirm that you agree to the Terms of Use and Privacy Policy before continuing.',
                  ),
                )
              else if (state.step == 1)
                Container(
                  child: GoBackAndContinueButtons(
                    onGoBackPressed: () => context.read<SpeedTestCubit>().previousStep(),
                    onContinuePressed: () => context.read<SpeedTestCubit>().nextStep(),
                  ),
                ),
              // const SizedBox(height: 35.0),

              // const SizedBox(height: 45.0)
            ],
          ),
        ),
      ),
    );
  }

  Future<ImageInfo> _loadCheckImageInfo(BuildContext context) async {
    AssetImage assetImage = const AssetImage(Images.check);
    ImageStream stream = assetImage.resolve(createLocalImageConfiguration(context));
    Completer<ImageInfo> completer = Completer();
    stream.addListener(ImageStreamListener((imageInfo, _) => completer.complete(imageInfo)));
    return completer.future;
  }
}
