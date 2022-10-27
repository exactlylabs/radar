import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/current_location_button.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';

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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            TitleAndSubtitle(
              title: Strings.locationStepTitle,
              subtitle: Strings.locationStepSubtitle,
            ),
            SizedBox(height: 30.0),
            LocationInputField(),
            CurrentLocationButton(),
          ],
        ),
        if (locationError != null || termsError != null) ErrorMessage(message: locationError ?? termsError!),
        AgreeToTerms(
          agreed: termsAccepted,
          onAgreed: (value) => context.read<SpeedTestCubit>().setTermsAccepted(value ?? false),
        ),
      ],
    );
  }
}
