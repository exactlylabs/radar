import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/core/models/location.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/leaflet_map.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/title_and_subtitle.dart';

class MapLocationPickerBody extends StatelessWidget {
  const MapLocationPickerBody({
    Key? key,
    required this.onChanged,
    required this.onConfirmed,
    required this.onChangeAddress,
    this.initialLocation,
  }) : super(key: key);

  final Location? initialLocation;
  final VoidCallback onConfirmed;
  final Function(double, double) onChanged;
  final VoidCallback onChangeAddress;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: TitleAndSubtitle(
            title: initialLocation == null ? Strings.noLocationModalTitle : Strings.locationModalTitle,
            subtitle: initialLocation == null ? Strings.noLocationModalSubtitle : Strings.locationModalSubtitle,
            subtitleHeight: 1.5,
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.4,
          child: Stack(
            alignment: Alignment.topCenter,
            children: [
              LeafletMap(
                address: initialLocation != null ? LatLng(initialLocation!.lat, initialLocation!.long) : null,
                onLocationSelected: (latlng) => onChanged(latlng.latitude, latlng.longitude),
              ),
              if (initialLocation != null)
                Container(
                  margin: const EdgeInsets.all(15.0),
                  padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
                  decoration: BoxDecoration(
                    color: AppColors.snow.withOpacity(0.85),
                    borderRadius: BorderRadius.circular(6.0),
                    boxShadow: const [
                      BoxShadow(
                        color: Color.fromARGB(40, 0, 0, 0),
                        offset: Offset(0, 1),
                        blurRadius: 6.0,
                        spreadRadius: -3,
                      ),
                    ],
                  ),
                  child: Text(
                    initialLocation!.address,
                    style: AppTextStyle(
                      color: AppColors.darkLavender,
                      fontSize: 14,
                      fontWeight: 200,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: PrimaryButton(
            onPressed: () {
              onConfirmed();
              Navigator.of(context).pop();
            },
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  Strings.confirmLocationButtonLabel,
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
        ),
        const SizedBox(height: 20.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: PrimaryButton(
            color: Theme.of(context).colorScheme.onPrimary,
            child: Text(
              Strings.changeAddressButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: AppColors.darkGrey,
              ),
            ),
            onPressed: () {
              onChangeAddress();
              Navigator.of(context).pop();
            },
          ),
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}
