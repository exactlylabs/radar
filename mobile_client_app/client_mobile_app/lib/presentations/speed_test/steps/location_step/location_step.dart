import 'package:client_mobile_app/core/services/locations_service/i_locations_service.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/steps/location_step/bloc/location_step_state.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/confirm_your_location_moda.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/current_location_button.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/goback_and_continue_buttons.dart';

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
    final double height = MediaQuery.of(context).size.height;
    return BlocProvider(
      create: (_) => LocationStepCubit(locationsService: context.read<ILocationsService>()),
      child: BlocBuilder<LocationStepCubit, LocationStepState>(
        builder: (context, state) {
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
                      print(context.read<LocationStepCubit>().state.isLoading);
                      return LocationInputField(
                        controller: controller,
                        focusNode: focusNode,
                        isLoading: context.read<LocationStepCubit>().state.isLoading,
                      );
                    },
                    displayStringForOption: (option) => option.address,
                    optionsBuilder: (value) async =>
                        await context.read<LocationStepCubit>().searchLocations(value.text),
                    onSelected: (value) {
                      // context.read<SpeedTestCubit>().setLocation(value);
                      // context.read<LocationStepCubit>().searchLocations(value.address);
                    },
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
                                  return InkWell(
                                    onTap: () => onSelected(option),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 17),
                                      child: Row(
                                        children: [
                                          Image.asset(Images.pinAddressIcon),
                                          const SizedBox(width: 15.0),
                                          Expanded(
                                            child: Text(
                                              option.address,
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                              style: AppTextStyle(
                                                color: AppColors.darkGrey,
                                                fontSize: 15.0,
                                                fontWeight: 200,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  const CurrentLocationButton(),
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
                onAgreed: (value) => context.read<SpeedTestCubit>().setTermsAccepted(value ?? false),
              ),
              SpacerWithMax(size: height * 0.043, maxSize: 35.0),
              GoBackAndContinueButtons(onContinuePressed: () => _confirmYourLocationModal(context, state.suggestions!)),
              SpacerWithMax(size: height * 0.053, maxSize: 45.0),
            ],
          );
        },
      ),
    );
  }

  Future<void> _confirmYourLocationModal(BuildContext context, List<Location> locations) {
    return modalWithTitle(
      context,
      true,
      Strings.emptyString,
      ConfirmYourLocationModal(
        suggestions: locations,
        onPressed: (location) {
          Navigator.of(context).pop();
          context.read<SpeedTestCubit>().setLocation(location);
        },
      ),
    );
  }
}
