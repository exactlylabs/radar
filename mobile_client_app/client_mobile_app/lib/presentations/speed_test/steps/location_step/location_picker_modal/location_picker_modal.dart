import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_picker_modal/map_location_picker_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_picker_modal/suggestions_list_location_picker_body.dart';

Future<void> mapModal(
    BuildContext context, bool? isScrollControlled, bool isUsingCurrentLocation, VoidCallback onPop) async {
  return showModalBottomSheet(
    context: context,
    backgroundColor: Theme.of(context).backgroundColor,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0))),
    isScrollControlled: isScrollControlled ?? false,
    builder: (_) => BlocProvider.value(
      value: BlocProvider.of<LocationStepCubit>(context),
      child: ModalWithTitle(
        title: '',
        padding: EdgeInsets.zero,
        body: LocationPickerModal(isUsingCurrentLocation: isUsingCurrentLocation),
        onPop: onPop,
      ),
    ),
  );
}

class LocationPickerModal extends StatefulWidget {
  const LocationPickerModal({
    Key? key,
    this.isUsingCurrentLocation = false,
  }) : super(key: key);

  final bool isUsingCurrentLocation;

  @override
  State<LocationPickerModal> createState() => _LocationPickerModalState();
}

class _LocationPickerModalState extends State<LocationPickerModal> {
  late bool _isLocationListed;

  @override
  void initState() {
    super.initState();
    _isLocationListed = true;
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<LocationStepCubit, LocationStepState>(
      builder: (context, state) {
        if ((state.suggestions?.isNotEmpty ?? false) &&
            state.suggestions!.length > 1 &&
            state.suggestedLocation == null &&
            state.currentLocation == null &&
            _isLocationListed) {
          return SuggestionsListLocationPickerBody(
            suggestions: state.suggestions!,
            suggestedLocation: state.suggestedLocation,
            onPressed: (suggestion) => context.read<LocationStepCubit>().setSuggestedLocation(suggestion),
            onAddressIsNotListed: () => setAddressIsNotListed(),
          );
        } else {
          return MapLocationPickerBody(
            initialLocation: widget.isUsingCurrentLocation ? state.currentLocation : state.suggestedLocation,
            onConfirmed: widget.isUsingCurrentLocation
                ? () => context.read<LocationStepCubit>().useCurrentLocation()
                : () => context.read<LocationStepCubit>().useSuggestedLocation(),
            onChanged: (lat, long) =>
                context.read<LocationStepCubit>().getDelayedLocationByLatLng(lat, long, !widget.isUsingCurrentLocation),
            onChangeAddress: () => context.read<LocationStepCubit>().reset(),
          );
        }
      },
    );
  }

  setAddressIsNotListed() {
    setState(() {
      _isLocationListed = false;
    });
  }
}
