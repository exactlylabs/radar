import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/core/utils/inherited_connectivity_status.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/current_location_button.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field_with_suggestions.dart';
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
    context.read<SpeedTestCubit>().setOnContinueAndOnGoBackPressed(() => _onContinuePressed(context));
    return GestureDetector(
      onTap: () => FocusScope.of(context).requestFocus(FocusNode()),
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
              LocationInputFieldWithSuggestions(
                key: locationInputFieldKey,
                location: widget.location,
                currentLocation: widget.currentLocation,
                suggestedLocation: widget.suggestedLocation,
                suggestions: widget.suggestions,
                isLoading: widget.isLoading,
                onSelected: (option) => context.read<LocationStepCubit>().setSuggestedLocation(option),
                suggestionsCallback: (value) => context.read<LocationStepCubit>().delayedSearch(value),
              ),
              SpacerWithMax(size: height * 0.0185, maxSize: 15.0),
              CurrentLocationButton(onPressed: () {
                if (InheritedConnectivityStatus.of(context).isConnected) {
                  context.read<LocationStepCubit>().getCurrentLocation();
                } else {
                  openNoInternetConnectionModal(context, () => context.read<LocationStepCubit>().getCurrentLocation());
                }
              }),
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
    );
  }

  void _onContinuePressed(BuildContext context) {
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
  }

  Future<void> _confirmYourLocationModal(BuildContext context, List<Location> locations) {
    return mapModal(context, true, false, () => context.read<LocationStepCubit>().reset());
  }
}
