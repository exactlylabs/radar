import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';

class AddressNotListedButton extends StatelessWidget {
  const AddressNotListedButton({
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
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            Strings.addressNotListedButtonLabel,
            style: AppTextStyle(
              color: Theme.of(context).colorScheme.tertiary,
              fontSize: 15.0,
              fontWeight: 700,
            ),
          ),
          const SizedBox(width: 5.0),
          Image.asset(
            Images.rightArrow,
            width: 10.0,
            height: 10.0,
            color: Theme.of(context).colorScheme.tertiary,
          ),
        ],
      ),
    );
  }
}
