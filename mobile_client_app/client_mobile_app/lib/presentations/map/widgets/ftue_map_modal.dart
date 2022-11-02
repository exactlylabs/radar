import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class FTUEMapModal extends StatelessWidget {
  const FTUEMapModal({
    Key? key,
    required this.onPressed,
  }) : super(key: key);

  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Our map shows all speed tests taken across the country. Tap a test to view more details or filter tests by speed results.',
          textAlign: TextAlign.center,
          // TODO(Nacho): Replace this style with AppTextStyle when merged
          style: TextStyle(
            fontSize: 16.0,
            color: Theme.of(context).colorScheme.primary,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 30.0),
        Image.asset(Images.mapIllustration),
        const SizedBox(height: 40.0),
        // TODO(Nacho): Replace this with PrimarButton when merged
        ElevatedButton(
          onPressed: onPressed,
          child: Text('Go to map'),
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}
