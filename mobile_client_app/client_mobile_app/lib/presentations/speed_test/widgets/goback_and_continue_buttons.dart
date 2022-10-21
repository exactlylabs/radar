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
          Expanded(
            child: PrimaryButton(
              onPressed: () {},
              color: Theme.of(context).colorScheme.onPrimary,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.arrow_back,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  const SizedBox(width: 15.0),
                  Text(
                    'Go back',
                    style: TextStyle(
                      fontSize: 16.0,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 20.0),
          Expanded(
            child: PrimaryButton(
              onPressed: () {},
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 16.0,
                      fontWeight: FontWeight.bold,
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
        ],
      );
    } else {
      return PrimaryButton(
        onPressed: () {},
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Continue',
              style: TextStyle(
                fontSize: 16.0,
                fontWeight: FontWeight.bold,
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
      );
    }
  }
}
