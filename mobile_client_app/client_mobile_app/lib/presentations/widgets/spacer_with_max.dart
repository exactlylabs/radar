import 'package:flutter/material.dart';

class SpacerWithMax extends StatelessWidget {
  const SpacerWithMax({
    Key? key,
    required this.size,
    required this.maxSize,
    this.isVertcal = true,
  }) : super(key: key);

  final bool isVertcal;
  final double size;
  final double maxSize;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: isVertcal
          ? size < maxSize
              ? size
              : maxSize
          : null,
      width: isVertcal
          ? null
          : size < maxSize
              ? size
              : maxSize,
    );
  }
}
