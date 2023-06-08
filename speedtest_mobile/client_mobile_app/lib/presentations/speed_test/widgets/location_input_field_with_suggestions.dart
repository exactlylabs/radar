import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_input_field.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_option_card.dart';

class LocationInputFieldWithSuggestions extends StatelessWidget {
  const LocationInputFieldWithSuggestions({
    Key? key,
    this.location,
    this.suggestions,
    this.isLoading = false,
    this.query,
    required this.onSelected,
    required this.suggestionsCallback,
  }) : super(key: key);

  final bool isLoading;
  final String? query;
  final Location? location;
  final List<Location>? suggestions;
  final Function(Location, bool) onSelected;
  final Function(String) suggestionsCallback;

  @override
  Widget build(BuildContext context) {
    return Autocomplete<Location>(
      fieldViewBuilder: (context, controller, focusNode, function) {
        if (location != null) {
          controller.text = location!.address;
          controller.selection = TextSelection.fromPosition(TextPosition(offset: controller.text.length));
        } else if (location == null && suggestions == null && !isLoading) {
          controller.text = Strings.emptyString;
        }
        if (focusNode.hasFocus) {
          WidgetsBinding.instance.addPostFrameCallback((_) => Scrollable.ensureVisible(context));
        }
        return LocationInputField(controller: controller, focusNode: focusNode, isLoading: isLoading);
      },
      displayStringForOption: (option) => option.address,
      optionsBuilder: (value) async => await suggestionsCallback(value.text),
      optionsViewBuilder: (context, _, options) {
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
                      onPressed: () => onSelected(option, index != options.length - 1),
                    );
                  },
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
