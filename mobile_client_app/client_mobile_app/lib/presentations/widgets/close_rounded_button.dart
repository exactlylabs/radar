import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';

class CloseRoundedButton extends StatelessWidget {
  const CloseRoundedButton({
    Key? key,
    required this.onTap,
    this.height,
    this.margin,
  }) : super(key: key);

  final VoidCallback onTap;
  final double? height;
  final EdgeInsets? margin;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: height,
        margin: margin,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Theme.of(context).colorScheme.surface.withOpacity(0.3),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
              spreadRadius: -2.0,
              blurRadius: 15.0,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Image.asset(Images.closeIcon),
      ),
    );
  }
}
