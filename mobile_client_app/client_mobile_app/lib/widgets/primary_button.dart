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
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        elevation: 0,
        disabledBackgroundColor: color?.withOpacity(0.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26.0)),
        shadowColor: shadowColor ?? Theme.of(context).colorScheme.secondary.withOpacity(0.5),
      ),
      onPressed: onPressed,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 16.0),
        child: child,
      ),
    );
  }
}
