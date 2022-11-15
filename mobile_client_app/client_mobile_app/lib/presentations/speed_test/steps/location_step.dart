import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/current_location_button.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';

class LocationStep extends StatelessWidget {
  const LocationStep({
    Key? key,
    this.formHeight = 0.0,
    this.location,
    this.locationError,
    this.termsAccepted = false,
    this.termsError,
  }) : super(key: key);

  final double formHeight;
  final Location? location;
  final String? locationError;
  final bool termsAccepted;
  final String? termsError;

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const TitleAndSubtitle(
              title: Strings.locationStepTitle,
              subtitle: Strings.locationStepSubtitle,
            ),
            SpacerWithMax(size: height * 0.037, maxSize: 30.0),
            LocationInputField(
              onChanged: (value) => context
                  .read<SpeedTestCubit>()
                  .setLocation(Location(address: value, lat: Strings.emptyString, long: Strings.emptyString)),
            ),
            const CurrentLocationButton(),
          ],
        ),
        if (locationError != null || termsError != null) ...[
          SpacerWithMax(size: height * 0.031, maxSize: 25.0),
          ErrorMessage(message: locationError ?? termsError!),
          SpacerWithMax(size: height * 0.053, maxSize: 45.0),
        ] else
          SpacerWithMax(size: height * 0.2, maxSize: 157.0),
        AgreeToTerms(
          agreed: termsAccepted,
          onAgreed: (value) => context.read<SpeedTestCubit>().setTermsAccepted(value ?? false),
        ),
        SpacerWithMax(size: height * 0.043, maxSize: 35.0),
        GoBackAndContinueButtons(onContinuePressed: () => context.read<SpeedTestCubit>().nextStep()),
        SpacerWithMax(size: height * 0.053, maxSize: 45.0),
      ],
    );
  }
}
