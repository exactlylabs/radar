import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_option_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/address_not_listed_button.dart';

class SuggestionsListLocationPickerBody extends StatefulWidget {
  const SuggestionsListLocationPickerBody({
    Key? key,
    required this.onPressed,
    required this.suggestions,
    required this.onAddressIsNotListed,
  }) : super(key: key);

  final List<Location> suggestions;
  final Function(Location) onPressed;
  final VoidCallback onAddressIsNotListed;

  @override
  State<SuggestionsListLocationPickerBody> createState() => _SuggestionsListLocationPickerBodyState();
}

class _SuggestionsListLocationPickerBodyState extends State<SuggestionsListLocationPickerBody> {
  int? _selectedLocationIndex;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            Strings.locationModalTitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 20.0,
              fontWeight: 800,
              height: 1.5,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const SizedBox(height: 10.0),
          Text(
            Strings.suggestionsModalSubtitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 200,
              height: 1.5,
              color: Theme.of(context).colorScheme.tertiary,
            ),
          ),
          const SizedBox(height: 20.0),
          SizedBox(
            height: (66.0 * (widget.suggestions.length)),
            child: ListView.separated(
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              itemCount: widget.suggestions.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10.0),
              itemBuilder: (context, index) {
                final suggestion = widget.suggestions[index];
                return LocationOptionCard(
                  location: suggestion,
                  onPressed: () => onSelected(index),
                  isSelected: _selectedLocationIndex == index,
                );
              },
            ),
          ),
          const SizedBox(height: 30.0),
          AddressNotListedButton(onPressed: widget.onAddressIsNotListed),
          const SizedBox(height: 35.0),
          PrimaryButton(
            onPressed: _selectedLocationIndex != null
                ? () => widget.onPressed(widget.suggestions[_selectedLocationIndex!])
                : null,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  Strings.continueButtonLabel,
                  style: AppTextStyle(
                    fontSize: 16.0,
                    fontWeight: 700,
                    color: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
                const SizedBox(width: 15.0),
                Icon(
                  Icons.arrow_forward,
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20.0),
          PrimaryButton(
            color: Theme.of(context).colorScheme.onPrimary,
            child: Text(
              Strings.cancelButttonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: AppColors.darkGrey,
              ),
            ),
            onPressed: () => Navigator.of(context).pop(),
          ),
          const SizedBox(height: 16.0),
        ],
      ),
    );
  }

  void onSelected(int index) {
    setState(() => _selectedLocationIndex = index);
  }
}
