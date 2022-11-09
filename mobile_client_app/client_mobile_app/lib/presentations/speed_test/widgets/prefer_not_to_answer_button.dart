import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';

class PreferNotToAnswerButton extends StatelessWidget {
  const PreferNotToAnswerButton({
    Key? key,
    this.onPressed,
  }) : super(key: key);

  final Function(String)? onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => onPressed != null ? onPressed!(Strings.emptyOption) : null,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            Strings.preferNotToAnswer,
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
