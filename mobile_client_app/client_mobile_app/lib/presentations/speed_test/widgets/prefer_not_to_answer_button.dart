import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class PreferNotToAnswerButton extends StatelessWidget {
  const PreferNotToAnswerButton({
    Key? key,
    this.onPressed,
  }) : super(key: key);

  final Function(String)? onPressed;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => onPressed != null ? onPressed!('I prefer not to answer') : null,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'I prefer not to answer',
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
