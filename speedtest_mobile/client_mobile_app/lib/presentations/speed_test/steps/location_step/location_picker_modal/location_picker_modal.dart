import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_state.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_picker_modal/map_location_picker_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/location_picker_modal/suggestions_list_location_picker_body.dart';

Future<void> mapModal(
    BuildContext context, bool? isScrollControlled, bool isUsingCurrentLocation, VoidCallback onPop) async {
  return showModalBottomSheet(
    context: context,
    backgroundColor: Theme.of(context).colorScheme.background,
    shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(topLeft: Radius.circular(16.0), topRight: Radius.circular(16.0))),
    isScrollControlled: isScrollControlled ?? false,
    builder: (_) => BlocProvider.value(
      value: BlocProvider.of<LocationStepCubit>(context),
      child: ModalWithTitle(
        title: '',
        padding: EdgeInsets.zero,
        body: const LocationPickerModal(),
        onPop: onPop,
      ),
    ),
  );
}

class LocationPickerModal extends StatefulWidget {
  const LocationPickerModal({
    Key? key,
  }) : super(key: key);

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
        if (!_isLocationListed ||
            (state.location != null && state.needsToConfirmLocation) ||
            (state.suggestions?.isEmpty ?? true)) {
          return MapLocationPickerBody(
            initialLocation: state.location,
            onChangeAddress: () => context.read<LocationStepCubit>().reset(),
            onChanged: (lat, long) => context.read<LocationStepCubit>().accurateLocation(lat, long),
            onConfirmed: state.location == null
                ? null
                : () => context.read<LocationStepCubit>().confirmInputLocation(state.location!),
          );
        } else {
          return SuggestionsListLocationPickerBody(
            suggestions: state.suggestions!,
            onAddressIsNotListed: () => setAddressIsNotListed(),
            onPressed: (location) => context.read<LocationStepCubit>().chooseLocationOption(location),
          );
        }
      },
    );
  }

  void setAddressIsNotListed() => setState(() => _isLocationListed = false);
}
