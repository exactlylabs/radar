import 'package:client_mobile_app/presentations/speed_test/widgets/permission_modals/manage_location_modal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
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
  }) : super(key: key);

  final double formHeight;
  final Location? location;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: BlocProvider(
        create: (_) => LocationStepCubit(
          location: location,
          locationsService: context.read<ILocationsService>(),
        ),
        child: BlocListener<LocationStepCubit, LocationStepState>(
          listenWhen: (previous, current) =>
              (!previous.requestLocationPermission && current.requestLocationPermission) ||
              (!previous.isLocationConfirmed && current.isLocationConfirmed) ||
              (!previous.needsToConfirmLocation && current.needsToConfirmLocation),
          listener: (context, state) {
            if (state.isLocationConfirmed) {
              final locationConfirmed =
                  state.isUsingGeolocation! ? state.geolocation : state.location;
              context.read<SpeedTestCubit>().setLocation(locationConfirmed!);
              context.read<SpeedTestCubit>().nextStep();
            } else if (state.needsToConfirmLocation) {
              _openConfirmYoutLocationModal(context);
            } else if (state.requestLocationPermission) {
              openManageLocationModal(
                context,
                onPressed: () => context.read<LocationStepCubit>().requestLocationPermission(),
                onClosed: () => context.read<LocationStepCubit>().cancelLocationPermissionRequest(),
              );
            }
          },
          child: BlocBuilder<LocationStepCubit, LocationStepState>(
            builder: (context, state) {
              if (state.isGeolocationEnabled == null) {
                return Container();
              }
              return Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0),
                    child: TitleAndSubtitle(
                      title: Strings.locationStepTitle,
                      subtitle: _getSubtitle(
                          state.isUsingGeolocation ?? false, state.isGeolocationLoading),
                      subtitleHeight: 1.56,
                      titleHeight: 1.81,
                    ),
                  ),
                  LocationStepBody(
                    query: state.query,
                    failure: state.failure,
                    location: state.location,
                    geolocation: state.geolocation,
                    suggestions: state.suggestions,
                    isUsingGeolocation: state.isUsingGeolocation,
                    isGeolocationLoading: state.isGeolocationLoading,
                    isGeolocationEnabled: state.isGeolocationEnabled!,
                    isLocationLoading: state.isLocationLoading,
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

  Future<void> _openConfirmYoutLocationModal(BuildContext context) {
    return mapModal(
      context,
      true,
      true,
      () => context.read<LocationStepCubit>().reset(),
    );
  }

  String _getSubtitle(bool isUsingGeolocation, bool isGeolocationLoading) {
    if (isUsingGeolocation && !isGeolocationLoading) {
      return Strings.locationStepSubtitleGeolocation;
    } else {
      return Strings.locationStepSubtitle;
    }
  }
}
