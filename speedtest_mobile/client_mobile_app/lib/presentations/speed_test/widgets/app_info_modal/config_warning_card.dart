import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/presentations/speed_test/widgets/app_info_modal/view_models/warning_view_model.dart';

class ConfigWarningCard extends StatelessWidget {
  const ConfigWarningCard({
    Key? key,
    required this.warning,
  }) : super(key: key);

  final WarningViewModel warning;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(15.0, 10.0, 15.0, 16.0),
      decoration: BoxDecoration(
        color: warning.isOptional
            ? AppColors.rockfish.withOpacity(0.1)
            : AppColors.error.withOpacity(0.1),
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
              height: 1.50,
              letterSpacing: 0.75,
              color: warning.isOptional ? AppColors.rockfish : AppColors.error,
            ),
          ),
          TextButton(
            onPressed: warning.onPressed,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  Strings.goToSettingsButtonLabel,
                  style: AppTextStyle(
                    fontSize: 15.0,
                    fontWeight: 800,
                    height: 1.50,
                    letterSpacing: 0.75,
                    color: warning.isOptional ? AppColors.rockfish : AppColors.error,
                  ),
                ),
                const SizedBox(width: 4.0),
                Image.asset(
                  Images.rightArrow,
                  height: 12.0,
                  color: warning.isOptional ? AppColors.rockfish : AppColors.error,
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
