import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/current_location_button.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_picker_modal/location_picker_modal.dart';

class LocationStepBody extends StatelessWidget {
  const LocationStepBody({
    Key? key,
    this.location,
    this.currentLocation,
    this.suggestedLocation,
    this.suggestions,
    this.locationError,
    this.termsError,
    this.termsAccepted = false,
    this.isLoading = false,
  }) : super(key: key);

  final Location? location;
  final Location? currentLocation;
  final Location? suggestedLocation;
  final List<Location>? suggestions;
  final String? locationError;
  final String? termsError;
  final bool termsAccepted;
  final bool isLoading;

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
            Autocomplete<Location>(
              fieldViewBuilder: (context, controller, focusNode, function) {
                if (location != null) {
                  controller.text = location!.address;
                } else if (currentLocation != null && currentLocation == location) {
                  controller.text = currentLocation!.address;
                } else if (currentLocation == null &&
                    suggestedLocation == null &&
                    location == null &&
                    suggestions == null &&
                    !isLoading) {
                  controller.text = Strings.emptyString;
                }
                return LocationInputField(controller: controller, focusNode: focusNode, isLoading: isLoading);
              },
              displayStringForOption: (option) => option.address,
              optionsBuilder: (value) async {
                return await context.read<LocationStepCubit>().delayedSearch(value.text);
              },
              onSelected: (option) => context.read<LocationStepCubit>().setSuggestedLocation(option),
              optionsViewBuilder: (context, onSelected, options) {
                return Padding(
                  padding: const EdgeInsets.only(top: 10.0),
                  child: Align(
                    alignment: Alignment.topLeft,
                    child: Material(
                      child: Container(
                        margin: const EdgeInsets.only(right: 40.0),
                        decoration: BoxDecoration(
                          color: AppColors.snow,
                          borderRadius: BorderRadius.circular(16.0),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.deepBlue.withOpacity(0.1),
                              blurRadius: 15.0,
                              spreadRadius: -2,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ListView.builder(
                          shrinkWrap: true,
                          padding: const EdgeInsets.all(5.0),
                          itemCount: options.length,
                          itemBuilder: (context, index) {
                            Location option = options.elementAt(index);
                            return LocationOptionCard(
                              location: option,
                              onPressed: () => onSelected(option),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
            CurrentLocationButton(onPressed: () => context.read<LocationStepCubit>().getCurrentLocation()),
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
          onAgreed: (value) {
            context.read<LocationStepCubit>().setTermsAccepted(value ?? false);
            context.read<SpeedTestCubit>().setTermsAccepted(value ?? false);
          },
        ),
        SpacerWithMax(size: height * 0.043, maxSize: 35.0),
        GoBackAndContinueButtons(
          onContinuePressed: () {
            if (!termsAccepted) {
              context.read<LocationStepCubit>().setTermsError();
            } else if (location != null) {
              // GO TO NEXT PAGE
              context.read<SpeedTestCubit>().setLocation(location!);
              context.read<SpeedTestCubit>().nextStep();
            } else if ((suggestions?.isNotEmpty ?? false) || suggestedLocation != null) {
              _confirmYourLocationModal(context, suggestions ?? []);
            } else {
              context.read<LocationStepCubit>().setLocationError();
            }
          },
        ),
        SpacerWithMax(size: height * 0.053, maxSize: 45.0),
      ],
    );
  }

  Future<void> _confirmYourLocationModal(BuildContext context, List<Location> locations) {
    return mapModal(context, true, false, () => context.read<LocationStepCubit>().reset());
  }
}
