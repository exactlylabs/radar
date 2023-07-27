import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/config_warning_card.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class AppInfo extends StatelessWidget {
  const AppInfo({
    Key? key,
    this.onEnabled,
    this.warning,
    required this.buildNumber,
    required this.versionNumber,
    required this.frequency,
    required this.isEnabled,
    required this.onDisabled,
  }) : super(key: key);

  final bool isEnabled;
  final int? frequency;
  final VoidCallback onDisabled;
  final VoidCallback? onEnabled;
  final WarningViewModel? warning;
  final String buildNumber;
  final String versionNumber;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Image.asset(Images.logoBig, height: 32.0),
        const SizedBox(height: 30.0),
        Text(
          'App version $versionNumber · Build $buildNumber',
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 14.0,
            fontWeight: 200,
            height: 1.071,
            color: AppColors.darkLavender,
          ),
        ),
        const SizedBox(height: 56.0),
        ElevatedButton(
          onPressed: isEnabled ? onDisabled : (onEnabled ?? () {}),
          style: ElevatedButton.styleFrom(
            foregroundColor: Theme.of(context).colorScheme.secondary,
            backgroundColor: isEnabled
                ? Theme.of(context).colorScheme.onPrimary
                : onEnabled == null
                    ? Theme.of(context).colorScheme.secondary.withOpacity(0.05)
                    : Theme.of(context).colorScheme.secondary.withOpacity(0.2),
            elevation: 0,
          ),
          child: Padding(
            padding: !isEnabled
                ? const EdgeInsets.all(14.0)
                : const EdgeInsets.fromLTRB(25.0, 14.0, 25.0, 14.0),
            child: Text(
              isEnabled ? Strings.appInfoDisableButtonLabel : Strings.appInfoEnableButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 400,
                color: onEnabled == null
                    ? Theme.of(context).colorScheme.secondary.withOpacity(0.3)
                    : Theme.of(context).colorScheme.secondary,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16.0),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: isEnabled && frequency != null
              ? RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    text: 'Background mode is enabled and will run speed tests in the background ',
                    style: AppTextStyle(
                      fontSize: 14.0,
                      fontWeight: 400,
                      height: 1.5,
                      color: Theme.of(context).colorScheme.tertiary,
                    ),
                    children: [
                      TextSpan(
                        text: 'every $frequency ${frequency == 1 ? 'minute' : 'minutes'}.',
                        style: AppTextStyle(fontWeight: 700),
                      ),
                    ],
                  ),
                )
              : Text(
                  Strings.appInfoDescription,
                  textAlign: TextAlign.center,
                  style: AppTextStyle(
                    fontSize: 14.0,
                    fontWeight: 200,
                    height: 1.5,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
        ),
        if (warning != null &&
            ((warning!.isOptional && isEnabled) || (!warning!.isOptional && !isEnabled)))
          Padding(
            padding: const EdgeInsets.only(top: 30.0),
            child: ConfigWarningCard(warning: warning!),
          ),
        const SizedBox(height: 50.0),
        Image.asset(Images.anthcBlueLogo, height: 35.0),
        const SizedBox(height: 55.0),
        Text(
          Strings.rightsReserved,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 14.0,
            fontWeight: 200,
            height: 1.5,
            color: AppColors.darkLavender,
          ),
        ),
        const SizedBox(height: 12.0),
        Text(
          Strings.devInfo,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 14.0,
            fontWeight: 200,
            height: 1.5,
            color: AppColors.darkLavender,
          ),
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}
