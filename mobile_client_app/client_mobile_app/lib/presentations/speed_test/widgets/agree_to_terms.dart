import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:flutter/material.dart';

class AgreeToTerms extends StatelessWidget {
  const AgreeToTerms({
    super.key,
    this.agreed = false,
  });

  final bool agreed;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Checkbox(
          value: agreed,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(6.0),
          ),
          onChanged: (value) {},
        ),
        Expanded(
          child: RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              text: 'I agree to the Radar’s ',
              style: const TextStyle(
                color: AppColors.darkGrey,
                fontFamily: 'MulishRoman',
                fontSize: 15,
                height: 2.0,
              ),
              children: [
                TextSpan(
                  text: 'Terms of Use',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.tertiary,
                    decoration: TextDecoration.underline,
                  ),
                ),
                const TextSpan(
                  text: ' and ',
                ),
                TextSpan(
                  text: 'Privacy Policy',
                  style: TextStyle(
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
