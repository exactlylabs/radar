import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/widgets/primary_button.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/error_message.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/time_interval_input_field.dart';

class EnableWardrivingMode extends StatelessWidget {
  const EnableWardrivingMode({
    Key? key,
    this.warning,
    this.delay,
    required this.onEnabled,
    required this.onChanged,
    required this.onCancel,
  }) : super(key: key);

  final String? warning;
  final int? delay;
  final VoidCallback onEnabled;
  final VoidCallback onCancel;
  final Function(String) onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            Strings.enableWardriveModalTitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 20.0,
              fontWeight: 800,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
          const SizedBox(height: 15),
          Text(
            Strings.enableWardriveModalSubtitle,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 16.0,
              fontWeight: 200,
              color: Theme.of(context).colorScheme.tertiary,
            ),
          ),
          const SizedBox(height: 30),
          TimeIntervalInputField(
            delay: delay,
            onChanged: onChanged,
          ),
          if (warning != null) ...[
            const SizedBox(height: 20),
            ErrorMessage(message: warning!),
            const SizedBox(height: 38),
          ] else
            const SizedBox(height: 101),
          PrimaryButton(
            onPressed: onEnabled,
            child: Text(
              Strings.enableWardriveModalButtonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
          ),
          const SizedBox(height: 20),
          PrimaryButton(
            color: Theme.of(context).colorScheme.onPrimary,
            shadowColor: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
            onPressed: onCancel,
            child: Text(
              Strings.cancelButttonLabel,
              style: AppTextStyle(
                fontSize: 16.0,
                fontWeight: 700,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
