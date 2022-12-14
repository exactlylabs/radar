import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class GoBackAndContinueButtons extends StatelessWidget {
  const GoBackAndContinueButtons({
    super.key,
    this.onGoBackPressed,
    this.onContinuePressed,
  });

  final VoidCallback? onGoBackPressed;
  final VoidCallback? onContinuePressed;

  @override
  Widget build(BuildContext context) {
    if (onGoBackPressed != null) {
      return Row(
        children: [
          Flexible(
            flex: 5,
            child: PrimaryButton(
              onPressed: onGoBackPressed,
              shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
              color: Theme.of(context).colorScheme.onPrimary,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    Images.leftArrow,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(width: 15.0),
                  Text(
                    'Go back',
                    style: AppTextStyle(
                      fontSize: 16.0,
                      fontWeight: 700,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 20.0),
          Flexible(
            flex: 6,
            child: PrimaryButton(
              shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.5),
              onPressed: onContinuePressed,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Continue',
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
          ),
        ],
      );
    } else {
      return PrimaryButton(
        onPressed: onContinuePressed,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Continue',
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
      );
    }
  }
}
