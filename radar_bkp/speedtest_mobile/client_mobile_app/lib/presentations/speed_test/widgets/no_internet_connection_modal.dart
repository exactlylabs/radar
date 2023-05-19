import 'package:client_mobile_app/core/utils/inherited_connectivity_status.dart';
import 'package:client_mobile_app/presentations/widgets/modal_with_title.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';

Future<void> openNoInternetConnectionModal(BuildContext context, VoidCallback onPressed) async {
  return modalWithTitle(
    context,
    true,
    Strings.emptyString,
    NoInternetConnectionModal(
      onPressed: () {
        if (InheritedConnectivityStatus.of(context).isConnected) {
          onPressed();
          Navigator.of(context).pop();
        }
      },
    ),
  );
}

class NoInternetConnectionModal extends StatelessWidget {
  const NoInternetConnectionModal({
    Key? key,
    required this.onPressed,
  }) : super(key: key);

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 15.0),
        Image.asset(Images.locationNoInternetBig, height: 50.0),
        const SizedBox(height: 30.0),
        Text(
          'No Internet connection',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 20.0,
            fontWeight: 800,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 15.0),
        Text(
          'Please make sure your device is connected to the Internet before continuing.',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: 1.56,
            color: AppColors.darkGrey,
          ),
        ),
        const SizedBox(height: 50.0),
        PrimaryButton(
          onPressed: onPressed,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Try again',
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 700,
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
        const SizedBox(height: 20.0),
        PrimaryButton(
          color: Theme.of(context).colorScheme.onPrimary,
          shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
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
