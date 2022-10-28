import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:flutter/material.dart';

class AgreeToTerms extends StatelessWidget {
  const AgreeToTerms({
    super.key,
    this.agreed = false,
    this.onAgreed,
  });

  final bool agreed;
  final Function(bool?)? onAgreed;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Checkbox(
          value: agreed,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          activeColor: Theme.of(context).colorScheme.secondary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(6.0),
          ),
          onChanged: onAgreed,
        ),
        Expanded(
          child: RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              text: 'I agree to the Radar’s ',
              style: AppTextStyle(
                color: Theme.of(context).colorScheme.primary,
                fontSize: 15,
                fontWeight: 400,
                height: 2.0,
                letterSpacing: 0.5,
              ),
              children: [
                TextSpan(
                  text: 'Terms of Use',
                  style: AppTextStyle(
                    color: Theme.of(context).colorScheme.tertiary,
                    decoration: TextDecoration.underline,
                  ),
                ),
                const TextSpan(
                  text: ' and ',
                ),
                TextSpan(
                  text: 'Privacy Policy',
                  style: AppTextStyle(
                    color: Theme.of(context).colorScheme.tertiary,
                    decoration: TextDecoration.underline,
                  ),
                ),
                const TextSpan(text: '.'),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
