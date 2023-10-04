import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/widgets/spacer_with_max.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/agree_to_terms.dart';
import 'package:client_mobile_app/presentations/speed_test/speed_test_bloc/speed_test_cubit.dart';

class AcceptTermsPage extends StatefulWidget {
  const AcceptTermsPage({
    Key? key,
  }) : super(key: key);

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
    setState(() => error = Strings.acceptTermsError);
  }

  void acceptTerms(bool value) {
    setState(() => termsAccepted = value);
  }

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height;
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Image.asset(Images.speedtest, height: 150.0),
            const SizedBox(height: 20.0),
            Text(
              Strings.acceptTermsTitle,
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
                Strings.acceptTermsSubtitle,
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
            SpacerWithMax(size: height * 0.047, maxSize: 40.0),
            PrimaryButton(
              shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.3),
              onPressed: () {
                if (termsAccepted) {
                  context.read<SpeedTestCubit>().acceptTerms();
                } else {
                  setError();
                }
              },
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    Strings.continueButtonLabel,
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
          ],
        ),
      ),
    );
  }
}
