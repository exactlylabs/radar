import 'package:client_mobile_app/resources/app_style.dart';
import 'package:flutter/material.dart';

class ErrorMessage extends StatelessWidget {
  const ErrorMessage({
    Key? key,
    required this.message,
  }) : super(key: key);

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 25.0),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: AppTextStyle(
          fontSize: 15.0,
          color: Theme.of(context).colorScheme.error,
          height: 1.5,
          fontWeight: 200,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
