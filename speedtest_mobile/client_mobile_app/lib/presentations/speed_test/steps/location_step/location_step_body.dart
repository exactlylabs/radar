import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/widgets/geolocation_option.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/widgets/input_location_option.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/widgets/location_step_options.dart';

class LocationStepBody extends StatelessWidget {
  const LocationStepBody({
    Key? key,
    required this.isGeolocationEnabled,
    required this.isGeolocationLoading,
    required this.isLocationLoading,
    this.isUsingGeolocation,
    this.geolocation,
    this.location,
    this.suggestions,
    this.failure,
    this.query,
  }) : super(key: key);

  /* NEW LOCATION STEP BODY ATTRIBUTES */
  final String? failure;
  final String? query;
  final Location? geolocation;
  final Location? location;
  final List<Location>? suggestions;
  final bool? isUsingGeolocation;
  final bool isGeolocationEnabled;
  final bool isGeolocationLoading;
  final bool isLocationLoading;

  @override
  Widget build(BuildContext context) {
    if (!isGeolocationEnabled || !(isUsingGeolocation ?? true)) {
      return InputLocationOption(
        error: failure,
        query: query,
        location: location,
        suggestions: suggestions,
        isLoading: isLocationLoading,
      );
    } else if (isUsingGeolocation == null) {
      return LocationStepOptions(
        isGeolocationLoading: isGeolocationLoading,
        onLocationInputPressed: () => context.read<LocationStepCubit>().useInputLocationOption(),
        onCurrentLocationPressed: () => context.read<LocationStepCubit>().useGeolocationOption(),
      );
    } else {
      return GeolocationOption(
        location: geolocation,
        onLocationInputPressed: () => context.read<LocationStepCubit>().useInputLocationOption(),
        onLocationConfirmed: () => context.read<LocationStepCubit>().confirmGeolocation(),
        onLocationChanged: (lat, long) => context.read<LocationStepCubit>().accurateGeolocation(lat, long),
      );
    }
  }
}
