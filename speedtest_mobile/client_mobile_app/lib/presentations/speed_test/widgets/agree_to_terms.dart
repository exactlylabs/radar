import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/core/flavors/app_config.dart';

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
    final privacyPolicyUrl =
        Uri.tryParse(AppConfig.of(context)?.stringResource.PRIVACY_POLICY_URL ?? '');
    return Row(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 20.0,
          height: 20.0,
          margin: const EdgeInsets.only(top: 3.0, right: 10.0),
          child: Transform.scale(
            scale: 1.2,
            child: Checkbox(
              value: agreed,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              activeColor: Theme.of(context).colorScheme.secondary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(6.0),
              ),
              side: BorderSide(
                width: 1.0,
                color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
              ),
              onChanged: onAgreed,
            ),
          ),
        ),
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            text: 'I agree to the Radar’s ',
            style: AppTextStyle(
              color: AppColors.darkGrey,
              fontSize: 15,
              fontWeight: 400,
              height: 1.66,
            ),
            children: [
              TextSpan(
                text: 'Privacy Policy',
                recognizer: privacyPolicyUrl != null
                    ? (TapGestureRecognizer()..onTap = () => launchUrl(privacyPolicyUrl))
                    : null,
                style: AppTextStyle(
                  color: Theme.of(context).colorScheme.tertiary,
                  decoration: TextDecoration.underline,
                ),
              ),
              const TextSpan(text: '.'),
            ],
          ),
        ),
      ],
    );
  }
}
