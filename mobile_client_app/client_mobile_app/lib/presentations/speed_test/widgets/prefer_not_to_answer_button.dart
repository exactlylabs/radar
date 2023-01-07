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
    return InkWell(
      onTap: () => onPressed != null ? onPressed!(Strings.emptyString) : null,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 2.0),
            child: Text(
              Strings.preferNotToAnswer,
              style: AppTextStyle(
                color: Theme.of(context).colorScheme.tertiary,
                fontSize: 15.0,
                height: 1.66,
                fontWeight: 700,
              ),
            ),
          ),
          const SizedBox(width: 5.0),
          Image.asset(
            Images.rightArrow,
            color: Theme.of(context).colorScheme.tertiary,
          ),
        ],
      ),
    );
  }
}
