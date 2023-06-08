import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/leaflet_map.dart';

class GeolocationOption extends StatelessWidget {
  const GeolocationOption({
    Key? key,
    this.location,
    required this.onLocationConfirmed,
    required this.onLocationInputPressed,
    required this.onLocationChanged,
  }) : super(key: key);

  final Location? location;
  final VoidCallback onLocationConfirmed;
  final VoidCallback onLocationInputPressed;
  final Function(double lat, double long) onLocationChanged;

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    return Column(
      children: [
        SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        SizedBox(
          height: 258,
          child: LeafletMap(
            onLocationSelected: (location) => onLocationChanged(location.latitude, location.longitude),
            address: LatLng(location!.lat, location!.long),
          ),
        ),
        SpacerWithMax(size: height * 0.05, maxSize: 40.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: Column(
            children: [
              PrimaryButton(
                shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.3),
                onPressed: onLocationConfirmed,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      Strings.continueButtonLabel,
                      style: AppTextStyle(
                        fontSize: 16.0,
                        fontWeight: 400,
                        letterSpacing: 1,
                        color: Theme.of(context).colorScheme.onPrimary,
                      ),
                    ),
                    const SizedBox(width: 15.0),
                    Image.asset(
                      Images.buttonRightArrow,
                      color: Theme.of(context).colorScheme.onPrimary,
                    ),
                  ],
                ),
              ),
              SpacerWithMax(size: height * 0.031, maxSize: 25.0),
              InkWell(
                onTap: onLocationInputPressed,
                child: Text(
                  Strings.enterAddressManuallyButtonLabel,
                  style: AppTextStyle(
                    color: Theme.of(context).colorScheme.tertiary,
                    fontSize: 15.0,
                    height: 1.66,
                    fontWeight: 600,
                  ),
                ),
              )
            ],
          ),
        ),
      ],
    );
  }
}
