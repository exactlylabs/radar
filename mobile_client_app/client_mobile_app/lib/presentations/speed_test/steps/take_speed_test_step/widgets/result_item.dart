import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';

class ResultItem extends StatelessWidget {
  const ResultItem({
    Key? key,
    required this.icon,
    required this.name,
    required this.unit,
    this.isEnabled = true,
    this.value,
  }) : super(key: key);

  final String icon;
  final String name;
  final String unit;
  final String? value;
  final bool isEnabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(icon, opacity: isEnabled ? null : const AlwaysStoppedAnimation<double>(0.5)),
            const SizedBox(width: 5.0),
            Text(
              name,
              style: AppTextStyle(
                fontSize: 14.0,
                fontWeight: 700,
                letterSpacing: 0.3,
                color: isEnabled
                    ? Theme.of(context).colorScheme.tertiary
                    : Theme.of(context).colorScheme.tertiary.withOpacity(0.5),
              ),
            ),
          ],
        ),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: value ?? Strings.emptyOption,
                style: AppTextStyle(
                  fontSize: 22.0,
                  fontWeight: 700,
                  color: value != null
                      ? isEnabled
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.primary.withOpacity(0.5)
                      : isEnabled
                          ? Theme.of(context).colorScheme.surface
                          : Theme.of(context).colorScheme.surface.withOpacity(0.5),
                ),
              ),
              TextSpan(
                text: ' $unit',
                style: AppTextStyle(
                  fontSize: 14.0,
                  fontWeight: 600,
                  color: value != null
                      ? isEnabled
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.primary.withOpacity(0.5)
                      : isEnabled
                          ? Theme.of(context).colorScheme.surface
                          : Theme.of(context).colorScheme.surface.withOpacity(0.5),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
