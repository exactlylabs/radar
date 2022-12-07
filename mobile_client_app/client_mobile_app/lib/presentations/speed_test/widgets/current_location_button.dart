import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class CurrentLocationButton extends StatelessWidget {
  const CurrentLocationButton({
    Key? key,
    this.onPressed,
  }) : super(key: key);

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(Images.location),
          const SizedBox(width: 8.0),
          Text(
            'Use my current location',
            style: AppTextStyle(
              fontSize: 15.0,
              fontWeight: 700,
              height: 1.66,
              color: Theme.of(context).colorScheme.secondary,
            ),
          ),
        ],
      ),
    );
  }
}
