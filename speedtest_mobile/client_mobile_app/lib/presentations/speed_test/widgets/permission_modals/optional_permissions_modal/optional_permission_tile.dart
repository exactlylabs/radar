import 'package:flutter/material.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/app_colors.dart';

class OptionalPermissionTile extends StatelessWidget {
  const OptionalPermissionTile({
    Key? key,
    required this.title,
    required this.description,
    this.isGranted = false,
  }) : super(key: key);

  final String title;
  final String description;
  final bool isGranted;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 2.0),
          child: Image.asset(isGranted ? Images.tickOn : Images.tickOff),
        ),
        const SizedBox(width: 12.0),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyle(
                  fontSize: 16.0,
                  height: 1.37,
                  fontWeight: 400,
                  color: AppColors.darkGrey,
                ),
              ),
              const SizedBox(height: 5.0),
              Text(
                description,
                style: AppTextStyle(
                  fontSize: 14.0,
                  height: 1.5,
                  fontWeight: 200,
                  color: AppColors.darkLavender,
                ),
              ),
            ],
          ),
        )
      ],
    );
  }
}
