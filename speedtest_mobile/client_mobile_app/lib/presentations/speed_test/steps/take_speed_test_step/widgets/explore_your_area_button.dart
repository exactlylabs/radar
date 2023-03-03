import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';

class ExploreYourAreaButton extends StatelessWidget {
  const ExploreYourAreaButton({
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
            Strings.exploreYourAreaButtonLabel,
            style: AppTextStyle(
              color: Theme.of(context).colorScheme.secondary,
              fontSize: 16.0,
              fontWeight: 700,
              height: 1.56,
            ),
          ),
          const SizedBox(width: 7.0),
          Container(
            margin: const EdgeInsets.only(top: 4.0),
            child: Image.asset(
              Images.buttonRightArrow,
              color: Theme.of(context).colorScheme.secondary,
            ),
          ),
        ],
      ),
    );
  }
}
