import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_cubit.dart';
import 'package:client_mobile_app/core/navigation_bloc/navigation_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/current_location_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/no_internet_connection_modal.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field_with_suggestions.dart';

class InputLocationOption extends StatefulWidget {
  const InputLocationOption({
    Key? key,
    this.location,
    this.suggestions,
    this.error,
    this.query,
    required this.isLoading,
  }) : super(key: key);

  final Location? location;
  final List<Location>? suggestions;
  final bool isLoading;
  final String? error;
  final String? query;

  @override
  State<InputLocationOption> createState() => _InputLocationOptionState();
}

class _InputLocationOptionState extends State<InputLocationOption> {
  final locationInputFieldKey = GlobalKey();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Stack(
          children: [
            GestureDetector(
              onTap: () => FocusScope.of(context).requestFocus(FocusNode()),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SpacerWithMax(size: height * 0.037, maxSize: 30.0),
                      LocationInputFieldWithSuggestions(
                        key: locationInputFieldKey,
                        query: widget.query,
                        location: widget.location,
                        suggestions: widget.suggestions,
                        isLoading: widget.isLoading,
                        onSelected: (option, canUseLocatoin) =>
                            context.read<LocationStepCubit>().chooseLocationOption(option, canUseLocatoin),
                        suggestionsCallback: (value) => context.read<LocationStepCubit>().delayedSearch(value),
                      ),
                      SpacerWithMax(size: height * 0.0185, maxSize: 15.0),
                      BlocBuilder<NavigationCubit, NavigationState>(
                        builder: (context, state) =>
                            CurrentLocationButton(onPressed: onGetCurrentLocationPressed(context, state.canNavigate)),
                      ),
                    ],
                  ),
                  if (widget.error != null) ...[
                    SpacerWithMax(size: height * 0.031, maxSize: 25.0),
                    ErrorMessage(message: widget.error!),
                    SpacerWithMax(size: height * 0.053, maxSize: 45.0),
                  ] else
                    SpacerWithMax(size: height * 0.2, maxSize: 157.0),
                  SpacerWithMax(size: height * 0.16, maxSize: 132.0),
                ],
              ),
            ),
            Positioned(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 0.0,
              right: 0.0,
              child: BlocBuilder<NavigationCubit, NavigationState>(
                builder: (context, state) => Padding(
                  padding: const EdgeInsets.only(bottom: 40.0),
                  child: GoBackAndContinueButtons(
                    onContinuePressed: (widget.location == null && widget.query == null)
                        ? null
                        : onContinuePressed(context, state.canNavigate),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  VoidCallback onGetCurrentLocationPressed(BuildContext context, bool canNavigate) {
    onCanNavigate() => context.read<LocationStepCubit>().useGeolocationOption();
    return canNavigate ? onCanNavigate : () => openNoInternetConnectionModal(context, onCanNavigate);
  }

  VoidCallback onContinuePressed(BuildContext context, bool canNavigate) {
    onCanNavigate() => context.read<LocationStepCubit>().chooseLocationOption();
    return canNavigate ? onCanNavigate : () => openNoInternetConnectionModal(context, onCanNavigate);
  }
}
