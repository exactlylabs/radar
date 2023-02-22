import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';

class AcceptTermsPage extends StatefulWidget {
  const AcceptTermsPage({
    Key? key,
    required this.onTermsAccepted,
  }) : super(key: key);

  final VoidCallback onTermsAccepted;

  @override
  State<AcceptTermsPage> createState() => _AcceptTermsPageState();
}

class _AcceptTermsPageState extends State<AcceptTermsPage> {
  String? error;
  bool termsAccepted = false;

  @override
  void initState() {
    super.initState();
    error = null;
  }

  void setError() {
    setState(() => error = 'Please confirm that you agree to the Terms of Use and Privacy Policy before continuing.');
  }

  void acceptTerms(bool value) {
    setState(() => termsAccepted = value);
  }

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Image.asset(Images.speedtest, height: 150.0),
        const SizedBox(height: 20.0),
        Text(
          'Test your Internet speed',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 22.0,
            fontWeight: 800,
            height: 1.8,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 10.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 5.0),
          child: Text(
            'We’ll ask you a few questions to better understand where and how you’re connected so we can learn more about your current service.',
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 200,
              height: 1.56,
              color: AppColors.darkGrey,
            ),
          ),
        ),
        if (error != null) ...[
          SpacerWithMax(size: height * 0.06, maxSize: 49.0),
          ErrorMessage(message: error!),
          SpacerWithMax(size: height * 0.06, maxSize: 49.0),
        ] else
          SpacerWithMax(size: height * 0.22, maxSize: 188.0),
        AgreeToTerms(
          agreed: termsAccepted,
          onAgreed: (value) => acceptTerms(value!),
        ),
        SpacerWithMax(size: height * 0.037, maxSize: 30.0),
        PrimaryButton(
          shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.3),
          onPressed: () {
            if (termsAccepted) {
              widget.onTermsAccepted();
            } else {
              setError();
            }
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Continue',
                style: AppTextStyle(
                  fontSize: 16.0,
                  fontWeight: 700,
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ),
              const SizedBox(width: 15.0),
              Image.asset(
                Images.buttonRightArrow,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ],
          ),
        ),
        SpacerWithMax(size: height * 0.055, maxSize: 45.0),
      ],
    );
  }
}
