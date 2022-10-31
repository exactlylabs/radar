import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class ExploreYoutAreaButton extends StatelessWidget {
  const ExploreYoutAreaButton({
    Key? key,
    this.onPressed,
  }) : super(key: key);

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            'Explore your area',
            style: AppTextStyle(
              color: Theme.of(context).colorScheme.secondary,
              fontSize: 16.0,
              fontWeight: 700,
            ),
          ),
          const SizedBox(width: 5.0),
          Image.asset(
            Images.rightArrow,
            color: Theme.of(context).colorScheme.secondary,
          ),
        ],
      ),
    );
  }
}
