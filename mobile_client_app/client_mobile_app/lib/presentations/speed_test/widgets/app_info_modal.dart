import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/strings.dart';
import 'package:flutter/material.dart';

class AppInfoModal extends StatelessWidget {
  const AppInfoModal({
    Key? key,
    required this.versionNumber,
    required this.buildNumber,
  }) : super(key: key);

  final String versionNumber;
  final String buildNumber;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
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
        const SizedBox(height: 50.0),
        Image.asset(Images.anthcBlueLogo, height: 35.0),
        const SizedBox(height: 55.0),
        Text(
          Strings.rightsReserved,
          textAlign: TextAlign.center,
          style: AppTextStyle(
            fontSize: 14.0,
            fontWeight: 200,
            color: AppColors.darkLavender,
          ),
        ),
        const SizedBox(height: 16.0),
      ],
    );
  }
}
