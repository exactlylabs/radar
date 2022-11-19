import 'package:client_mobile_app/resources/app_colors.dart';
import 'package:client_mobile_app/resources/app_style.dart';
import 'package:client_mobile_app/resources/images.dart';
import 'package:flutter/material.dart';

class LocationOptionCard extends StatelessWidget {
  const LocationOptionCard({
    Key? key,
    required this.address,
    required this.onPressed,
    this.isSelected = false,
    this.decoration,
  }) : super(key: key);

  final String address;
  final bool isSelected;
  final VoidCallback onPressed;
  final BoxDecoration? decoration;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        decoration: decoration,
        padding: const EdgeInsets.fromLTRB(20, 18, 10, 18),
        child: Row(
          children: [
            Image.asset(Images.pinAddressIcon),
            const SizedBox(width: 15.0),
            Expanded(
              child: Text(
                address,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: isSelected
                    ? AppTextStyle(
                        color: AppColors.deepBlue,
                        fontSize: 16.0,
                        fontWeight: 700,
                      )
                    : AppTextStyle(
                        color: AppColors.darkGrey,
                        fontSize: 16.0,
                        fontWeight: 200,
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
