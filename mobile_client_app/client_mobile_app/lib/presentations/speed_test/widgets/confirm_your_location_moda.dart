import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/location_option_card.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class ConfirmYourLocationModal extends StatefulWidget {
  const ConfirmYourLocationModal({
    Key? key,
    required this.onPressed,
    required this.suggestions,
  }) : super(key: key);

  final Function(Location) onPressed;
  final List<Location> suggestions;

  @override
  State<ConfirmYourLocationModal> createState() => _ConfirmYourLocationModalState();
}

class _ConfirmYourLocationModalState extends State<ConfirmYourLocationModal> {
  int? _selectedLocationIndex;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Confirm your location',
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
          'Please select your address from the list below.',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: 1.5,
            color: AppColors.darkGrey,
          ),
        ),
        const SizedBox(height: 20.0),
        SizedBox(
          height: 300,
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: widget.suggestions.length,
            separatorBuilder: (context, index) => const SizedBox(height: 10.0),
            itemBuilder: (context, index) {
              final suggestion = widget.suggestions[index];
              return LocationOptionCard(
                address: suggestion.address,
                onPressed: () => onSelected(index),
                decoration: _selectedLocationIndex == index
                    ? BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        border: Border.all(
                          color: Theme.of(context).colorScheme.secondary,
                          width: 2.0,
                        ),
                      )
                    : BoxDecoration(
                        borderRadius: BorderRadius.circular(8.0),
                        border: Border.all(
                          color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                          width: 1.0,
                        ),
                      ),
              );
            },
          ),
        ),
        PrimaryButton(
          onPressed: _selectedLocationIndex != null
              ? () => widget.onPressed(widget.suggestions[_selectedLocationIndex!])
              : null,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                Strings.yesContinueButtonLabel,
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
    );
  }

  void onSelected(int index) {
    setState(() => _selectedLocationIndex = index);
  }
}
