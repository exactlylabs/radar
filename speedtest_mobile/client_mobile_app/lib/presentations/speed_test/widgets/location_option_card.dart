import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/core/models/location.dart';

class LocationOptionCard extends StatelessWidget {
  const LocationOptionCard({
    Key? key,
    required this.location,
    required this.onPressed,
    this.isSelected = false,
    this.decoration,
  }) : super(key: key);

  final Location location;
  final bool isSelected;
  final VoidCallback onPressed;
  final BoxDecoration? decoration;

  @override
  Widget build(BuildContext context) {
    final hideSubtitle =
        ((location.houseNumber?.isEmpty ?? true) || (location.street?.isEmpty ?? true));
    return ListTile(
      onTap: onPressed,
      selected: isSelected,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 3.0),
      minLeadingWidth: 10.0,
      visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
      dense: true,
      leading: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Image.asset(
            Images.roundedPinAddress,
            width: 32.0,
            height: 32.0,
            color: isSelected
                ? Theme.of(context).colorScheme.secondary
                : Theme.of(context).colorScheme.primary.withOpacity(0.4),
          ),
        ],
      ),
      title: Text(
        hideSubtitle ? location.address! : '${location.houseNumber} ${location.street}',
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: AppTextStyle(
          fontSize: 15.0,
          color: Theme.of(context).colorScheme.primary,
          fontWeight: 600,
        ),
      ),
      subtitle: hideSubtitle
          ? null
          : Text(
              '${location.city}, ${location.state} ${location.postalCode}',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyle(
                fontSize: 13.0,
                color: Theme.of(context).colorScheme.tertiary,
                fontWeight: 200,
              ),
            ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
        side: isSelected
            ? BorderSide(
                color: Theme.of(context).colorScheme.secondary,
                width: 2.0,
              )
            : BorderSide(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                width: 1.0,
              ),
      ),
    );
  }
}
