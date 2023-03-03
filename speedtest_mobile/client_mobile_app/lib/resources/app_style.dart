import 'dart:ui';

import 'package:flutter/material.dart';

class AppTextStyle extends TextStyle {
  AppTextStyle({
    double? fontSize,
    double? fontWeight,
    Color? color,
    double? letterSpacing,
    double? height,
    TextDecoration? decoration,
  }) : super(
          leadingDistribution: TextLeadingDistribution.even,
          fontSize: fontSize,
          color: color,
          letterSpacing: letterSpacing,
          height: height,
          decoration: decoration,
          fontFamily: 'Mulish',
          fontVariations: [
            if (fontWeight != null) FontVariation('wght', fontWeight),
          ],
        );
}
