import 'package:client_mobile_app/presentations/speed_test/widgets/location_indicator.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class NoInternetModal extends StatelessWidget {
  const NoInternetModal({
    Key? key,
    required this.address,
    required this.onPressed,
  }) : super(key: key);

  final String address;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Image.asset(Images.locationNoInternetBig, height: 50.0),
        const SizedBox(height: 30.0),
        Text(
          Strings.noInternetConnectionModalTitle,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 20.0,
            fontWeight: 800,
            height: 1.5,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 15.0),
        Text(
          Strings.noInternetConnectionModalSubtitle,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: 1.5,
            color: AppColors.darkGrey,
          ),
        ),
        const SizedBox(height: 35.0),
        LocationIndicator(address: address),
        const SizedBox(height: 45.0),
        PrimaryButton(
          onPressed: onPressed,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                Strings.iDontHaveInternetButtonLabel,
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
}
