import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:flutter/material.dart';

class ConfigWarningCard extends StatelessWidget {
  const ConfigWarningCard({
    Key? key,
    required this.warning,
  }) : super(key: key);

  final WarningViewModel warning;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14.0),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Column(
        children: [
          Text(
            warning.description,
            textAlign: TextAlign.center,
            style: AppTextStyle(
              fontSize: 14.0,
              fontWeight: 200,
              height: 1.150,
              letterSpacing: 0.25,
              color: AppColors.rockfish,
            ),
          ),
          TextButton(
            onPressed: warning.onPressed,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Go to device settings',
                  style: AppTextStyle(
                    fontSize: 14.0,
                    fontWeight: 500,
                    height: 1.150,
                    letterSpacing: 0.25,
                    color: AppColors.rockfish,
                  ),
                ),
                const SizedBox(width: 4.0),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 14.0,
                  color: AppColors.rockfish,
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
