import 'dart:async';

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

class LocationStepBody extends StatefulWidget {
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
  State<LocationStepBody> createState() => _LocationStepBodyState();
}

class _LocationStepBodyState extends State<LocationStepBody> {
  final locationInputFieldKey = GlobalKey();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return GestureDetector(
      onTap: () => FocusScope.of(context).requestFocus(FocusNode()),
      child: Stack(
        children: [
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const TitleAndSubtitle(
                      title: Strings.locationStepTitle,
                      subtitle: Strings.locationStepSubtitle,
                      subtitleHeight: 1.56,
                      titleHeight: 1.81,
                    ),
                    SpacerWithMax(size: height * 0.037, maxSize: 30.0),
                    Autocomplete<Location>(
                      fieldViewBuilder: (context, controller, focusNode, function) {
                        if (widget.location != null) {
                          controller.text = widget.location!.address;
                        } else if (widget.currentLocation != null && widget.currentLocation == widget.location) {
                          controller.text = widget.currentLocation!.address;
                        } else if (widget.currentLocation == null &&
                            widget.suggestedLocation == null &&
                            widget.location == null &&
                            widget.suggestions == null &&
                            !widget.isLoading) {
                          controller.text = Strings.emptyString;
                        }
                        return LocationInputField(
                            key: locationInputFieldKey,
                            controller: controller,
                            focusNode: focusNode,
                            isLoading: widget.isLoading);
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
                    SpacerWithMax(size: height * 0.0185, maxSize: 15.0),
                    CurrentLocationButton(onPressed: () => context.read<LocationStepCubit>().getCurrentLocation()),
                  ],
                ),
                if (widget.locationError != null || widget.termsError != null) ...[
                  SpacerWithMax(size: height * 0.031, maxSize: 25.0),
                  ErrorMessage(message: widget.locationError ?? widget.termsError!),
                  SpacerWithMax(size: height * 0.053, maxSize: 45.0),
                ] else
                  SpacerWithMax(size: height * 0.2, maxSize: 157.0),
                AgreeToTerms(
                  agreed: widget.termsAccepted,
                  onAgreed: (value) {
                    context.read<LocationStepCubit>().setTermsAccepted(value ?? false);
                    context.read<SpeedTestCubit>().setTermsAccepted(value ?? false);
                  },
                ),
                SpacerWithMax(size: height * 0.16, maxSize: 132.0),
              ],
            ),
          ),
          Positioned(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 0.0,
            right: 0.0,
            child: Padding(
              padding: const EdgeInsets.only(bottom: 45.0),
              child: GoBackAndContinueButtons(
                onContinuePressed: () {
                  if (!widget.termsAccepted) {
                    context.read<LocationStepCubit>().setTermsError();
                  } else if (widget.location != null) {
                    context.read<SpeedTestCubit>().setLocation(widget.location!);
                    context.read<SpeedTestCubit>().nextStep();
                  } else if ((widget.suggestions?.isNotEmpty ?? false) || widget.suggestedLocation != null) {
                    _confirmYourLocationModal(context, widget.suggestions ?? []);
                  } else {
                    context.read<LocationStepCubit>().setLocationError();
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmYourLocationModal(BuildContext context, List<Location> locations) {
    return mapModal(context, true, false, () => context.read<LocationStepCubit>().reset());
  }
}
