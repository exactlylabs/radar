import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';

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
          'Explore Map',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 20.0,
            fontWeight: 800,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 15.0),
        Text(
          'Our map shows all speed tests taken across the country. Tap a test to view more details or filter tests by speed results.',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 16.0,
            fontWeight: 200,
            height: 1.5,
            color: AppColors.darkGrey,
          ),
        ),
        const SizedBox(height: 30.0),
        Image.asset(Images.mapIllustration),
        const SizedBox(height: 40.0),
        PrimaryButton(
          onPressed: onPressed,
          child: Text(
            'Go to map',
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 700,
              color: Theme.of(context).colorScheme.onPrimary,
            ),
          ),
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}
