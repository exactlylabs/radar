import 'package:client_mobile_app/resources/app_style.dart';
import 'package:flutter/material.dart';

class IconWithText extends StatelessWidget {
  const IconWithText({
    Key? key,
    required this.icon,
    required this.text,
    this.alignment = MainAxisAlignment.center,
  }) : super(key: key);

  final String icon;
  final String text;
  final MainAxisAlignment alignment;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 5.0, vertical: 8.0),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: alignment,
        children: [
          Image.asset(icon),
          const SizedBox(width: 8),
          Flexible(
            fit: FlexFit.loose,
            child: Text(
              text,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyle(
                fontSize: 15.0,
                fontWeight: 700,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
