import 'dart:ui';

import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:flutter/material.dart';

class TitleAndSubtitle extends StatelessWidget {
  const TitleAndSubtitle({
    super.key,
    required this.title,
    required this.subtitle,
    this.titleHeight,
    this.subtitleHeight,
  });

  final String title;
  final String subtitle;
  final double? titleHeight;
  final double? subtitleHeight;

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.height;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          title,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 22.0,
            fontWeight: 800,
            height: titleHeight,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        SpacerWithMax(
          size: height * 0.006,
          maxSize: 5,
        ),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: subtitleHeight,
            letterSpacing: 0.25,
            color: Theme.of(context).colorScheme.tertiary,
          ),
        ),
      ],
    );
  }
}
