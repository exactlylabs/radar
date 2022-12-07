import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    super.key,
    required this.child,
    this.color,
    this.shadowColor,
    this.onPressed,
  });

  final VoidCallback? onPressed;
  final Color? color;
  final Color? shadowColor;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: shadowColor ?? AppColors.blue.withOpacity(0.5),
            offset: const Offset(0, 4),
            blurRadius: 15.0,
            spreadRadius: -2.0,
          ),
        ],
      ),
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          elevation: 0,
          disabledBackgroundColor: color?.withOpacity(0.5),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26.0)),
        ),
        onPressed: onPressed,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16.0),
          child: child,
        ),
      ),
    );
  }
}
