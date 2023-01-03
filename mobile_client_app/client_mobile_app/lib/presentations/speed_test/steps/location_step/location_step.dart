import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_step_body.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_picker_modal/location_picker_modal.dart';

class LocationStep extends StatelessWidget {
  const LocationStep({
    Key? key,
    this.formHeight = 0.0,
    this.location,
    this.termsAccepted = false,
  }) : super(key: key);

  final double formHeight;
  final Location? location;
  final bool termsAccepted;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: BlocProvider(
        create: (_) => LocationStepCubit(
          locationsService: context.read<ILocationsService>(),
          location: location,
          termsAccepted: termsAccepted,
        ),
        child: BlocListener<LocationStepCubit, LocationStepState>(
          listenWhen: (previous, current) =>
              (previous.loadingCurrentLocation && !current.loadingCurrentLocation && current.locationError == null) ||
              (previous.suggestedLocation != null && current.location == previous.suggestedLocation),
          listener: (context, state) {
            if (state.location != null && state.location == state.suggestedLocation) {
              context.read<SpeedTestCubit>().setLocation(state.location!);
              context.read<SpeedTestCubit>().nextStep();
            } else {
              _openConfirmYoutLocationModal(context, state.currentLocation);
            }
          },
          child: BlocBuilder<LocationStepCubit, LocationStepState>(
            builder: (context, state) {
              return LocationStepBody(
                location: state.location,
                currentLocation: state.currentLocation,
                locationError: state.locationError,
                termsError: state.termsError,
                termsAccepted: state.termsAccepted,
                isLoading: state.isLoading,
                suggestedLocation: state.suggestedLocation,
                suggestions: state.suggestions,
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _openConfirmYoutLocationModal(BuildContext context, Location? location) {
    return mapModal(
      context,
      true,
      true,
      () => context.read<LocationStepCubit>().reset(),
    );
  }
}
